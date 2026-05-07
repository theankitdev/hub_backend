import express from "express";
import authRoutes from "../routes/auth.route.js";
import postRoutes from "../routes/post.route.js";
import productRoutes from "../routes/product.route.js"
import chatRoutes from "../routes/chat.route.js"
import userRoutes from "../routes/user.route.js"


const router = express.Router();


router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/products", productRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);

export default router;