const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  blogs: [
    {
      type: Schema.Types.ObjectId, ref: "Blog"
    }
  ],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = model("User", userSchema);
