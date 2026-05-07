import Message from "../model/message.model.js";
import User from "../model/user.model.js";
import { getIO } from "../config/socket.js";
import sendPushNotification from "../services/pushNotificationService.js";

export const sendMessage =
    async (req, res) => {

        try {

            const {
                receiverId,
                text,
            } = req.body;

            // VALIDATION

            if (
                receiverId ===
                req.user._id.toString()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You cannot chat with yourself",

                });
            }

            // EMPTY MESSAGE

            if (!text?.trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message cannot be empty",

                });
            }

            // CHECK RECEIVER EXISTS

            const receiver =
                await User.findById(
                    receiverId
                );

            if (!receiver) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Receiver not found",

                });
            }

            // CREATE MESSAGE

            const message =
                await Message.create({

                    sender:
                        req.user._id,

                    receiver:
                        receiverId,

                    text:
                        text.trim(),

                });

            // POPULATE

            const populatedMessage =
                await Message.findById(
                    message._id
                )

                    .populate(
                        "sender",
                        "name profileImage"
                    )

                    .populate(
                        "receiver",
                        "name profileImage"
                    );

            // SOCKET EVENT

            getIO()

                .to(receiverId)

                .emit(
                    "newMessage",
                    populatedMessage
                );

            // PUSH NOTIFICATION

            if (
                receiver?.expoPushToken
            ) {

                await sendPushNotification(

                    receiver.expoPushToken,

                    "New Message",

                    text
                );
            }

            res.status(201).json({

                success: true,

                message:
                    populatedMessage,

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

export const getMessages = async (req, res) => {
    try {

        const messages = await Message.find({
            $or: [
                {
                    sender: req.user._id,
                    receiver: req.params.userId,
                },
                {
                    sender: req.params.userId,
                    receiver: req.user._id,
                },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};