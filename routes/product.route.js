import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createProduct,
  getProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", getProducts);

export default router;