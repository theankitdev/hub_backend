import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  getMessages,
  sendMessage,
  getChatList
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:userId", protect, getMessages);
router.get("/chats", protect, getChatList);

export default router;