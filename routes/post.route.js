import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createPost,
  getPosts,
  likePost,
} from "../controllers/post.controller.js";
import upload from "../middleware/multer.js"

const router = express.Router();

router.post(
    "/",
    protect,
    upload.single("image"),
    createPost
);
router.get("/", getPosts);
router.put("/like/:id", protect, likePost);

export default router;