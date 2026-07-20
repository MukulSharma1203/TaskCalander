import express from "express";

import protect from "../middleware/auth.middleware.js";

import dashboard from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(protect);

router.get("/:month", dashboard);

export default router;