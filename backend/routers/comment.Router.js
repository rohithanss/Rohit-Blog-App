const { Router } = require("express");
// const mongoose = require("mongoose");

const CommentModel = require("../models/CommentModel.js");
const authorise = require("../middlewares/authorise.js");
const tokenAuth = require("../middlewares/tokenAuth.js");
const BlogModel = require("../models/BlogModel.js");
const { default: mongoose } = require("mongoose");

const commentRouter = Router();

commentRouter.post(
  "/:blogId",
  tokenAuth,
  authorise(["user", "admin", "writer"]),
  async (req, res) => {
    let { blogId } = req.params;
    let { comment, userId } = req.body;
    if (comment == undefined) {
      return res.send({ msg: "some fields are missing", status: "fail" });
    }
    try {
      let userComment = await CommentModel({ blogId, userId, comment });
      await userComment.save();
      await BlogModel.findByIdAndUpdate(
        { _id: blogId },
        { $inc: { comments: 1 } }
      );
      return res
        .status(201)
        .send({ msg: "Comment posted successfully", status: "success" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "something went wrong", status: "error" });
    }
  }
);

commentRouter.get("/:blogId", async (req, res) => {
  let blogId = mongoose.Types.ObjectId(req.params.blogId);

  try {
    let comments = await CommentModel.aggregate().match({ blogId });
    return res.send({ comments });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ msg: "Something went wrong", status: "error" });
  }
});

commentRouter.patch(
  "/:commentId",
  tokenAuth,
  authorise(["user", "admin", "writer"]),
  async (req, res) => {
    let { comment, userId } = req.body;
    let commentId = req.params.commentId;
    if (comment == undefined || comment.trim() == "") {
      return res.send({
        msg: "Some fields contains wrong data",
        status: "fail",
      });
    }
    try {
      let resp = await CommentModel.findOneAndUpdate(
        {
          _id: commentId,
          userId,
        },
        { comment }
      );
      if (resp != null) {
        return res
          .status(200)
          .send({ msg: "Comment updated successfully", status: "success" });
      } else {
        return res
          .status(401)
          .send({ msg: "Comment can not updated", status: "fail" });
      }
    } catch (err) {
      return res.status(500).send({
        msg: "Something went wrong while updating comment",
        status: "error",
      });
    }
  }
);

commentRouter.delete(
  "/:commentId",
  tokenAuth,
  authorise(["user", "admin", "writer"]),
  async (req, res) => {
    let { userId } = req.body;
    let commentId = req.params.commentId;
    try {
      let commentExists = await CommentModel.findOne({
        _id: commentId,
        userId,
      });

      if (commentExists?.blogId) {
        let resp = await CommentModel.findOneAndDelete({
          _id: commentId,
          userId,
        });
        if (resp != null) {
          await BlogModel.findByIdAndUpdate(
            { _id: commentExists?.blogId },
            { $inc: { comments: -1 } }
          );
          return res
            .status(200)
            .send({ msg: "Comment Deleted successfully", status: "success" });
        } else {
          return res.status(500).send({
            msg: "Something went wrong while deleting comment",
            status: "error",
          });
        }
      } else {
        return res
          .status(401)
          .send({ msg: "Comment can not deleted", status: "fail" });
      }
    } catch (err) {
      return res.status(500).send({
        msg: "Something went wrong while deleting comment",
        status: "error",
      });
    }
  }
);

module.exports = commentRouter;
