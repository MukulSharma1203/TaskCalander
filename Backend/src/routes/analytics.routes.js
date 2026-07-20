import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
    dailyAnalytics,
    monthlyAnalytics,
    heatmapAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.use(protect);

router.get("/day/:date", dailyAnalytics);
router.get("/month/:month", monthlyAnalytics);
router.get("/heatmap/:month", heatmapAnalytics);
export default router;