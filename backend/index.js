const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  path: "/iocomments",
});
const session = require("express-session");

const BlogModel = require("./models/BlogModel.js");
const CommentModel = require("./models/CommentModel.js");
const connection = require("./config/db");
const port = process.env.port;
const userRouter = require("./routers/user.Router");
const adminRouter = require("./routers/admin.Router");
const blogRouter = require("./routers/blog.Router");
const commentRouter = require("./routers/comment.Router");
const likeRouter = require("./routers/like.Router");
const authRouter = require("./routers/auth.Router");
const getfreshtokenRouter = require("./routers/getfreshtoken.Router");
const generateOtpRouter = require("./routers/generateOtp.Router.js");

app.use(
  session({
    secret: "keyboard",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use(express.json());

const whitelist = [
  "http://localhost:5173",
  "https://rohit-blog-app.netlify.app",
];
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use("/auth", authRouter);

app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.options("*", cors(corsOptionsDelegate));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("todo API");
});

app.use("/user", userRouter);

app.use("/admin", adminRouter);

app.use("/getfreshtoken", getfreshtokenRouter);

app.use("/comments", commentRouter);

app.use("/likes", likeRouter);

app.use("/blogs", blogRouter);

app.use("/getotp", generateOtpRouter);
let user = 0;

io.on("connection", (socket) => {
  console.log("connected");
  console.log(++user);

  socket.on("getComments", async (blogId, cb) => {
    socket.join(blogId);
    blogId = mongoose.Types.ObjectId(blogId);
    try {
      let comments = await CommentModel.aggregate()
        .match({ blogId })
        .lookup({
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        })
        .project({
          userId: { $first: "$user._id" },
          userName: { $first: "$user.name" },
          comment: 1,
        });
      cb({ data: comments, status: "success" });
    } catch (err) {
      console.log(err);
      cb({
        msg: "failed to get comments try again later",
        status: "error",
      });
    }
  });

  socket.on("postComment", async (blogId, comment, userId, cb) => {
    if (userId != "not_logged_in") {
      try {
        let userComment = await CommentModel({ blogId, userId, comment });
        let postedComment = await userComment.save();
        await BlogModel.findByIdAndUpdate(
          { _id: blogId },
          { $inc: { comments: 1 } }
        );

        let newComment = await CommentModel.aggregate()
          .match({ _id: postedComment._id })
          .lookup({
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          })
          .project({
            userId: { $first: "$user._id" },
            userName: { $first: "$user.name" },
            comment: 1,
          });

        io.to(blogId).emit("newComment", {
          data: newComment[0],
          status: "success",
        });
        cb({ msg: "comment posted successfully", status: "success" });
      } catch (err) {
        console.log(err);
        cb({
          msg: "failed to post comment try again later",
          status: "error",
        });
      }
    } else {
      cb({
        msg: "failed to post comment try again later",
        status: "fail",
      });
    }
  });

  socket.on("editComment", async (blogId, comment, userId, commentId, cb) => {
    if (
      userId != "not_logged_in" &&
      userId != undefined &&
      commentId != undefined
    ) {
      try {
        let updatedComment = await CommentModel.findOneAndUpdate(
          { _id: commentId, userId },
          { comment }
        );
        if (updatedComment == null) {
          return cb({ msg: "comment can be not updated", status: "fail" });
        } else {
          commentId = mongoose.Types.ObjectId(commentId);
          let editedComment = await CommentModel.aggregate()
            .match({ _id: commentId })
            .lookup({
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            })
            .project({
              userId: { $first: "$user._id" },
              userName: { $first: "$user.name" },
              comment: 1,
            });
          io.to(blogId).emit("editedComment", {
            data: editedComment[0],
            status: "success",
          });
          cb({ msg: "comment edited successfully", status: "success" });
        }
      } catch (err) {
        cb({
          msg: "failed to edit comment try again later",
          status: "fail",
        });
      }
    } else {
      cb({
        msg: "failed to edit comment try again later",
        status: "fail",
      });
    }
  });

  socket.on("deleteComment", async (blogId, userId, commentId, cb) => {
    if (
      userId != "not_logged_in" &&
      userId != undefined &&
      commentId != undefined
    ) {
      try {
        let deletedComment = await CommentModel.findOneAndDelete({
          _id: commentId,
          userId,
        });
        if (deletedComment == null) {
          cb({ msg: "comment can be not deleted", status: "fail" });
        } else {
          await BlogModel.findByIdAndUpdate(
            { _id: blogId },
            { $inc: { comments: -1 } }
          );
          io.to(blogId).emit("deletedComment", {
            data: commentId,
            status: "success",
          });
          cb({ msg: "comment deleted successfully", status: "success" });
        }
      } catch (err) {
        // console.log(err);
        cb({
          msg: "failed to delete comment try again later",
          status: "fail",
        });
      }
    } else {
      cb({
        msg: "failed to delete comment try again later",
        status: "fail",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(--user);
  });
});

server.listen(port, async () => {
  try {
    connection;
    console.log("DB connected");
    console.log(`listening at \nhttp://localhost:${port}`);
  } catch (err) {
    console.log(err);
    console.log("error while connection to DB");
  }
});
