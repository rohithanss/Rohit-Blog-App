const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: String,
  content: String,
  comments: Number,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const BlogModel = mongoose.model("blog", blogSchema);

module.exports = BlogModel;
