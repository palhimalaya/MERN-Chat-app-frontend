const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Type.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Type.ObjectId, ref: "Chat" },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messageModel);
module.exports = Message;
