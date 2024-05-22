const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Blog = require('../models/blog');
const Comment = require('../models/comment');

const resolvers = {
  Query: {
    users: async () => await User.find(),
    blogs: async () => await Blog.find(),
    comments: async () => await Comment.find(),
  },
  Mutation: {
    signup: async (_, { name, email, password }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error('A user already exists with this email!');
        const hashedPassword = bcrypt.hashSync(password);
        const user = new User({ name, email, password: hashedPassword });
        return await user.save();
      } catch (error) {
        throw new Error('User signup failed!');
      }
    },
    login: async (_, { email, password }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) throw new Error('Invalid email or password!');
        const isPasswordValid = bcrypt.compareSync(password, existingUser.password);
        if (!isPasswordValid) throw new Error("Incorrect password!");
        return existingUser;
      } catch (error) {
        throw new Error('User login failed!');
      }
    },
    addBlog: async (_, { title, content, date, user }) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const blog = new Blog({ title, content, date, user });
        const existingUser = await User.findById(user);
        if (!existingUser) throw new Error("User not found!");
        existingUser.blogs.push(blog);
        await existingUser.save({ session });
        const savedBlog = await blog.save({ session });
        await session.commitTransaction();
        return savedBlog;
      } catch (error) {
        await session.abortTransaction();
        throw new Error(error);
      } finally {
        session.endSession();
      }
    },
    updateBlog: async (_, { id, title, content }) => {
      try {
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) throw new Error('Blog does not exist!');
        return await Blog.findByIdAndUpdate(id, { title, content }, { new: true });
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteBlog: async (_, { id }) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) throw new Error('Blog does not exist!');
        const existingUser = await User.findById(existingBlog.user);
        if (!existingUser) throw new Error("No user Linked to this blog!");
        existingUser.blogs.pull(existingBlog);
        await existingUser.save({ session });
        await existingBlog.remove({ session });
        await session.commitTransaction();
        return existingBlog;
      } catch (error) {
        await session.abortTransaction();
        throw new Error(error);
      } finally {
        session.endSession();
      }
    },
    addComment: async (_, { text, date, user, blog }) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const comment = new Comment({ text, date, user, blog });
        const existingUser = await User.findById(user);
        if (!existingUser) throw new Error("User not found!");
        existingUser.comments.push(comment);
        await existingUser.save({ session });

        const existingBlog = await Blog.findById(blog);
        if (!existingBlog) throw new Error("Blog not found!");
        existingBlog.comments.push(comment);
        await existingBlog.save({ session });

        const savedComment = await comment.save({ session });
        await session.commitTransaction();
        return savedComment;
      } catch (error) {
        await session.abortTransaction();
        throw new Error(error);
      } finally {
        session.endSession();
      }
    },
    deleteComment: async (_, { id }) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error("Comment not found!");

        const existingUser = await User.findById(comment.user);
        if (!existingUser) throw new Error("User not found!");
        existingUser.comments.pull(comment);
        await existingUser.save({ session });

        const existingBlog = await Blog.findById(comment.blog);
        if (!existingBlog) throw new Error("Blog not found!");
        existingBlog.comments.pull(comment);
        await existingBlog.save({ session });

        await Comment.findByIdAndDelete(id);
        await session.commitTransaction();
        return comment;
      } catch (error) {
        await session.abortTransaction();
        throw new Error(error);
      } finally {
        session.endSession();
      }
    }
  },
  User: {
    blogs: async (parent) => await Blog.find({ user: parent.id }),
    comments: async (parent) => await Comment.find({ user: parent.id })
  },
  Blog: {
    user: async (parent) => await User.findById(parent.user),
    comments: async (parent) => await Comment.find({ blog: parent.id })
  },
  Comment: {
    user: async (parent) => await User.findById(parent.user),
    blog: async (parent) => await Blog.findById(parent.blog)
  }
};

module.exports = resolvers;
