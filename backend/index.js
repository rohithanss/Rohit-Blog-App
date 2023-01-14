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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
// app.enable("trust proxy");

app.get("/", (req, res) => {
  res.send("todo API");
});

app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.use("/auth", authRouter);

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
        msg: "failed to posting comment try again later",
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
