const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    comment: String,
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamp: true }
);

const CommentModel = mongoose.model("comment", commentSchema);

module.exports = CommentModel;
