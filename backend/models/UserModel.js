const findOrCreate = require("mongoose-findorcreate");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    googleId: String,
    githubId: String,
    name: String,
    email: String,
    password: String,
    picture: String,
    role: { type: String, enum: ["writer", "user"], default: "user" },
  },
  { timestamps: true }
);
userSchema.plugin(findOrCreate);
const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
