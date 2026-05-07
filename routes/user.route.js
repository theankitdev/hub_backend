import express from "express";
import protect from "../middleware/auth.middleware.js";
import { savePushToken, getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/save-token", protect, savePushToken);
router.get("/all", protect, getAllUsers);

export default router;