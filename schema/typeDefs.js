const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    blogs: [Blog]
    comments: [Comment]
  }

  type Blog {
    id: ID!
    title: String!
    content: String!
    date: String!
    user: User
    comments: [Comment]
  }

  type Comment {
    id: ID!
    text: String!
    date: String!
    blog: Blog
    user: User
  }

  type Query {
    users: [User]
    blogs: [Blog]
    comments: [Comment]
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): User
    addBlog(title: String!, content: String!, date: String!, user: ID!): Blog
    updateBlog(id: ID!, title: String!, content: String!): Blog
    deleteBlog(id: ID!): Blog
    addComment(text: String!, date: String!, user: ID!, blog: ID!): Comment
    deleteComment(id: ID!): Comment
  }
`;

module.exports = typeDefs;
