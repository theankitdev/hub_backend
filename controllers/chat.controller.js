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


export const getChatList = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id.toString();

    const users =
      await User.find({
        _id: { $ne: userId },
      }).select(
        "name profileImage"
      );

    const messages =
      await Message.find({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
      }).sort({
        createdAt: -1,
      });

    const chatList = users.map(
      (user) => {
        const lastMessage =
          messages.find(
            (msg) =>
              (msg.sender.toString() ===
                userId &&
                msg.receiver.toString() ===
                  user._id.toString()) ||
              (msg.receiver.toString() ===
                userId &&
                msg.sender.toString() ===
                  user._id.toString())
          );

        return {
          user: {
            _id: user._id,
            name: user.name,
            profileImage:
              user.profileImage ||
              null,
          },

          lastMessage:
            lastMessage?.text || "",

          lastMessageTime:
            lastMessage?.createdAt ||
            null,

          unread: false,
        };
      }
    );

    chatList.sort((a, b) => {
      if (!a.lastMessageTime)
        return 1;

      if (!b.lastMessageTime)
        return -1;

      return (
        new Date(
          b.lastMessageTime
        ) -
        new Date(
          a.lastMessageTime
        )
      );
    });

    res.json({
      success: true,
      chatList,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};