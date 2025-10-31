const express = require("express");
const router = express.Router();
const { User, Chat, Message, Assets } = require("./collections");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const pythonServer = "http://localhost:5000";

router.post("/test", async (req, res) => {
  return "test";
});

// Register API
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (user) {
    return res.status(400).send("User already exists");
  }
  user = new User({ username, password });
  await user.save();
  res.status(201).send("User registered successfully");
});

// Login API
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(400).send("Invalid username or password");
  }
  res.status(200).send("Login successful");
});

router.get("/assetUrl/:fileId", async (req, res) => {
  const asset = await Assets.findOne({ _id: req.params.fileId });
  res.sendFile(asset.url);
});

// pdf parser API
router.post("/upload/:chatId", async (req, res) => {
  try {
    const formData = new FormData();
    const file = req.files.pdf;
    const isNewChat = req.params.chatId == "new";
    console.log("isNewChat", isNewChat, file.name);

    formData.append("file", file.data, {
      filename: file.name,
      contentType: file.mimetype,
    });

    const response = await axios.post(`${pythonServer}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "application/json",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const asset = await Assets.create({
      name: response.data.name,
      url: response.data.url,
    });

    let chat = null;
    if (isNewChat) {
      chat = await Chat.create({
        title: file.name,
        attachments: [asset._id],
      });
    } else {
      chat = await Chat.findOne({ _id: req.params.chatId });
      chat.attachments.push(asset._id);
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    res.status(500).send("Error processing PDF file");
  }
});

//chat with python
router.post("/prompt/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { text, sender } = req.body;
    const chat = await Chat.findById(chatId);
    chat.messages.push({ text, sender });
    await chat.save();
    const attachmentUrls = await Promise.all(
      chat.attachments.map(async (asset) => {
        a = await Assets.findOne({ _id: asset }, { url: 1, _id: 0 });
        return a.url;
      })
    );
    data = { text, urls: attachmentUrls, chatId };
    console.log(data);

    const response = await axios.post(`${pythonServer}/prompt`, data, {
      headers: {
        Accept: "application/json",
      },
    });
    resData = response.data;

    chat.messages.push({ text: resData.text, sender: resData.sender });
    await chat.save();

    res.status(200).json({ text: resData.text, sender: resData.sender });
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    res.status(500).send("Error processing PDF file");
  }
});

router.post("/chatlist", async (req, res) => {
  const { userId } = req.body;
  const userChats = await Chat.find({ user: "testUser" }).sort({
    _id: -1,
  });
  // console.log(userChats);

  res.status(200).send(userChats);
});

router.get("/chat/:chatId", async (req, res) => {
  const chatId = req.params.chatId;
  console.log("running at 132");

  const chat = await Chat.findById(chatId).lean();
  const attachmentUrls = await Promise.all(
    chat.attachments.map(async (asset) => {
      a = await Assets.findOne({ _id: asset });
      return a;
    })
  );
  chat.attachments = attachmentUrls;
  console.log("chat 142", chat);

  res.status(200).json(chat);
});

router.delete("/chat/:chatId", async (req, res) => {
  const chatId = req.params.chatId;
  const chat = await Chat.deleteOne({ _id: chatId });
  // for (let i = 0; i < chat.attachments.length; i++) {
  //   const asset = await Assets.findOne({ _id: chat.attachments[i] });
  //   chat.attachments[i] = asset.url;
  // }
  res.status(200).json(chat);
});

router.post("/chat/:chatId/message", async (req, res) => {
  console.log("chatId", req.params.chatId);

  const chatId = req.params.chatId;
  const { text, sender } = req.body;
  if (chatId == "new") {
    const chat = await Chat.create({ messages: [{ text, sender }] });
    return res.status(200).json(chat);
  } else {
    const chat = await Chat.findById(chatId);
    chat.messages.push({ text, sender });
    await chat.save();
    res.status(200).json(chat);
  }
});

module.exports = router;
