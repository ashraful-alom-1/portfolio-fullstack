const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// POST: save a new message
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET: fetch all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
