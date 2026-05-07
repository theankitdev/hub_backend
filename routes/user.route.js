import express from "express";
import protect from "../middleware/auth.middleware.js";
import { savePushToken, getAllUsers, updateProfile } from "../controllers/user.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/save-token", protect, savePushToken);
router.get("/all", protect, getAllUsers);
router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  updateProfile
);

export default router;