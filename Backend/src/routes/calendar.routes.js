import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
    getMonth,
    getDay,
    updateDay,
} from "../controllers/calendar.controller.js";

const router = express.Router();

router.use(protect);

router.get("/:month", getMonth);

router.get("/day/:date", getDay);

router.put("/day/:date", updateDay);

export default router;