const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(res, userId, userRole) {
  // console.log(userId.toString());

  let token = jwt.sign({ userId, userRole }, process.env.secret_key, {
    expiresIn: "1h",
  });
  let refreshToken = jwt.sign({ userId, userRole }, process.env.refresh_Key, {
    expiresIn: "5h",
  });
  res.cookie("token", token, { maxAge: 1000 * 60 * 60 });
  res.cookie("refreshToken", refreshToken, { maxAge: 1000 * 60 * 300 });
  return { token, refreshToken };
}

module.exports = generateToken;
