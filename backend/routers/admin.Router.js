const { Router } = require("express");

const authorise = require("../middlewares/authorise.js");
const tokenAuth = require("../middlewares/tokenAuth.js");
const UserModel = require("../models/UserModel");

const adminRouter = Router();

adminRouter.get("/users", tokenAuth, authorise(["admin"]), async (req, res) => {
  try {
    let users = await UserModel.find({ role: { $ne: "admin" } });
    res.send({ msg: "Users fetched Successfully", users, status: "success" });
  } catch (err) {
    res.send({ msg: "something went wrong", status: "error" });
  }
});

adminRouter.patch(
  "/user/:userId",
  tokenAuth,
  authorise(["admin"]),
  async (req, res) => {
    try {
      let userId = req.params.userId;
      let { name, email, role } = req.body;

      let resp = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { name, email, role } }
      );
      res.send({ msg: "user updated successfully", status: "success" });
    } catch (err) {
      res.send({ msg: "something went wrong", status: "error" });
      console.log(err);
    }
  }
);
adminRouter.delete(
  "/user/:userId",
  tokenAuth,
  authorise(["admin"]),
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let resp = await UserModel.findByIdAndDelete({ _id: userId });
      res.send({ msg: "user deleted successfully", status: "success" });
    } catch (err) {
      res.send({ msg: "something went wrong", status: "error" });
      console.log(err);
    }
  }
);
module.exports = adminRouter;
