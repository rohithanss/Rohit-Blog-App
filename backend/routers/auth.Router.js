const { Router } = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserModel = require("../models/UserModel");
const generateToken = require("../services/generateToken.js");

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ========================== Passport Strategy Starts here ==============================

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:7010/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      UserModel.findOrCreate(
        { googleId: "" + profile.id },
        async (err, user) => {
          if (err) {
            res.send("error while logging in via google");
          } else {
            console.log(profile);
            UserModel.findByIdAndUpdate(
              user._id,
              {
                name: profile.displayName,
                email: profile.emails[0]?.value,
                picture: profile.photos[0]?.value,
              },
              function (err, docs) {
                return cb(err, docs);
              }
            );
          }
        }
      );
    }
  )
);

// ========================== Passport Strategy End here ==============================
let authRouter = Router();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http:localhost:7010/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    // console.log(req, res);
    // let userId = req.session.passport.user._id.toString();
    let { _id, role } = req.session.passport.user;
    generateToken(res, _id, role);
    res.redirect("http://localhost:5173/");
  }
);

authRouter.get("/github", async (req, res) => {
  // gitHub oAuth
  const { code } = req.query;
  //   console.log("code:", code);
  try {
    let accessToken = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );
    let { access_token } = await accessToken.json();
    let userDetail = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    userDetail = await userDetail.json();
    UserModel.findOrCreate(
      { githubId: "" + userDetail.id },
      async (err, user) => {
        if (err) {
          res.send("error while logging in via github");
        } else {
          UserModel.findByIdAndUpdate(
            user._id,
            { name: userDetail.name, email: userDetail.email },
            function (err, docs) {
              generateToken(res, docs._id, docs.role);
              res.redirect("http://localhost:5173/");
            }
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.send({ msg: "log in fail, try again later" });
  }
});

module.exports = authRouter;
