import express from "express";
import { getCategories } from "../controllers/category.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCategories);

export default router;