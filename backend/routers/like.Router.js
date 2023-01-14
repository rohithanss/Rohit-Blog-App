const { Router } = require("express");
// const mongoose = require("mongoose");

const BlogModel = require("../models/BlogModel.js");
const authorise = require("../middlewares/authorise.js");
const tokenAuth = require("../middlewares/tokenAuth.js");
const { default: mongoose } = require("mongoose");

const likeRouter = Router();

likeRouter.post(
  "/:blogId",
  tokenAuth,
  authorise(["user", "writer", "admin"]),
  async (req, res) => {
    let { blogId } = req.params;
    let { userId } = req.body;

    try {
      let blog = await BlogModel.findById({ _id: blogId });

      if (await blog?.likes?.includes(userId)) {
        await BlogModel.findByIdAndUpdate(
          { _id: blogId },
          { $pull: { likes: userId } }
        );
        return res
          .status(201)
          .send({ msg: "un-like operation successfully", status: "success" });
      } else {
        await BlogModel.findByIdAndUpdate(
          { _id: blogId },
          { $push: { likes: userId } }
        );
        return res
          .status(201)
          .send({ msg: "liked operation successfully", status: "success" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "something went wrong", status: "error" });
    }
  }
);

likeRouter.get("/:blogId", async (req, res) => {
  let blogId = mongoose.Types.ObjectId(req.params.blogId);

  try {
    let likes = await BlogModel.aggregate()
      .match({ _id: blogId })
      .lookup({
        from: "users",
        localField: "likes",
        foreignField: "_id",
        as: "likes",
      })
      .project({ "likes.name": 1, "likes.email": 1 });
    console.log(likes);
    return res.send(likes[0].likes);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ msg: "Something went wrong", status: "error" });
  }
});

module.exports = likeRouter;
