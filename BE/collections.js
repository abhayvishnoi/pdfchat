const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
const chatSchema = new mongoose.Schema({
  user: { type: String, required: true, default: "testUser" },
  messages: { type: [messageSchema], required: false },
  attachments: { type: [String] },
  title: { type: String },
});
const Chat = mongoose.model("Chat", chatSchema);

const assetsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const Assets = mongoose.model("Assets", assetsSchema);

module.exports = { User, Chat, Message, Assets };
