const { Router } = require("express");
const jwt = require("jsonwebtoken");

const getfreshtokenRouter = Router();

getfreshtokenRouter.post("/", (req, res) => {
  let refreshToken =
    req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];
  if (refreshToken) {
    try {
      jwt.verify(refreshToken, process.env.refresh_key, (err, decoded) => {
        if (err) {
          console.log(err);
          res.status(401).send({ msg: "please login again", status: "fail" });
        } else {
          const { userId, userRole } = decoded;
          const newToken = jwt.sign(
            { userId, userRole },
            process.env.secret_key,
            {
              expiresIn: "1h",
            }
          );
          res.cookie("token", newToken);
          return res.send({ token: newToken, status: "success" });
        }
      });
    } catch (err) {
      res.status(501).send({ msg: "internal error", status: "error" });
    }
  } else {
    res.status(401).send({ msg: "please login again", status: "fail" });
  }
});

module.exports = getfreshtokenRouter;
