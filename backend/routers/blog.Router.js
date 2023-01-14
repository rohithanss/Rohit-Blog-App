const { Router } = require("express");

const BlogModel = require("../models/BlogModel");
const tokenAuth = require("../middlewares/tokenAuth.js");
const authorise = require("../middlewares/authorise.js");

const blogRouter = Router();

blogRouter.get("/", async (req, res) => {
  try {
    let blogs;
    blogs = await BlogModel.aggregate()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      })
      .project({
        likedBy: "$likes",
        likes: { $size: "$likes" },
        writer: { $first: "$userId.name" },
        writerId: { $first: "$userId._id" },
        comments: 1,
        title: 1,
        content: 1,
      });

    res.send({
      msg: "Blogs fetched successfully",
      data: blogs,
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.send({ msg: "Error while fetching the Blogs", status: "error" });
  }
});

blogRouter.get("/:blogId", async (req, res) => {
  let blogId = req.params.blogId;
  try {
    let blogs = await BlogModel.findOne({
      userId: req.body.userId,
      _id: blogId,
    });

    res.send({
      msg: "blogs fetched successfully",
      data: blogs,
      status: "success",
    });
  } catch (err) {
    res.send({ msg: "Error while fetching the blogs", status: "error" });
  }
});

blogRouter.post(
  "/create",
  tokenAuth,
  authorise(["writer"]),
  async (req, res) => {
    let { title, content, userId } = req.body;
    if (title == undefined || content == undefined || userId == undefined) {
      res.send({ msg: "some fields are missing", status: "fail" });
      return;
    }
    try {
      let blog = new BlogModel({
        title,
        content,
        userId,
        likes: [],
        comments: 0,
      });
      let savedBlog = await blog.save();
      res.send({
        msg: "blog added successfully",
        _id: savedBlog._id,
        status: "success",
      });
    } catch (err) {
      res.send({ msg: "error creating blog", status: "error" });
    }
  }
);

blogRouter.patch(
  "/update/:blogId",
  tokenAuth,
  authorise(["writer"]),
  async (req, res) => {
    let payload = req.body;
    let blogId = req.params.blogId;
    try {
      let response = await BlogModel.findOneAndUpdate(
        {
          userId: payload.userId,
          _id: blogId,
        },
        { title: payload.title, content: payload.content }
      );

      if (response == null) {
        res.send({ msg: "blog can not be updated", status: "fail" });
      } else {
        res.send({ msg: "blog updated successfully", status: "success" });
      }
    } catch (err) {
      console.log(err);
      res.send({ msg: "error while updating try again", status: "error" });
    }
  }
);

blogRouter.delete(
  "/delete/:blogId",
  tokenAuth,
  authorise(["writer", "admin"]),
  async (req, res) => {
    let { userId } = req.body;
    let blogId = req.params.blogId;
    let payload;
    if (req.body.userRole == "admin") {
      payload = { _id: blogId };
    } else {
      payload = {
        userId,
        _id: blogId,
      };
    }
    try {
      let response = await BlogModel.findOneAndDelete(payload);

      if (response == null) {
        res.send({ msg: "blog can not be Deleted", status: "fail" });
      } else {
        res.send({ msg: "blog Deleted successfully", status: "success" });
      }
    } catch (err) {
      res.send({ msg: "error while deleting try again", status: "error" });
    }
  }
);
module.exports = blogRouter;
