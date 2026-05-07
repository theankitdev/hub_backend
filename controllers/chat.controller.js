import Message from "../model/message.model.js";
import User from "../model/user.model.js";
import { getIO } from "../config/socket.js";
import sendPushNotification from "../services/pushNotificationService.js";


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // Cannot message yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    // Empty message
    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });

    // Populate sender & receiver
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    
    const io = getIO();
    io.to(receiverId).emit("newMessage", populatedMessage);
    io.to(req.user._id.toString()).emit("newMessage", populatedMessage);

    
    if (receiver?.expoPushToken) {
      await sendPushNotification(receiver.expoPushToken, "New Message", text);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ createdAt: -1 }); // newest first

    const chatMap = new Map();

    for (const msg of messages) {
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

      const otherId = otherUser._id.toString();

    
      if (otherId === userId.toString()) continue;

      if (!chatMap.has(otherId)) {
        chatMap.set(otherId, {
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            profileImage: otherUser.profileImage ?? null,
          },
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unread: false, 
        });
      }
    }

    const chatList = Array.from(chatMap.values());

    res.json({ success: true, chatList });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};