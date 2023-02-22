const express = require("express");
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const keyGenerationRoutes = require("./routes/keyGenerationRoutes");
const fs = require("fs");
const upload = require("./helper/multer");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
dotenv.config();

connectDB();
app.use(cors());

app.use(express.json());

app.post("/image-upload", upload.single("image"), (req, res) => {
  console.log("uploaded image:", req.file.filename);
  res.json({ filename: req.file.filename });
});

app.get("/", (req, res) => {
  res.send("Api is working successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/key", keyGenerationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const server = app.listen(
  PORT,
  console.log(`Server started on port ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (data) => {
    socket.join(data.room);
    room = data.room;
    publicKey = data.publicKey;
    socket.to(room).emit("public key", { room, publicKey });
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageReceived) => {
    // console.log(newMessageReceived);

    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      const encD = Buffer.from(newMessageReceived.content, "hex");

      const data = {
        newMessageReceived,
        encD: encD,
      };

      socket.in(user._id).emit("message received", data);
    });
  });
  socket.on("image", (data) => {
    console.log("received image");
    io.emit("image", data);
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
