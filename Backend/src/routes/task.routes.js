import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
    createTask,
    getAllTasks,
    getTasksByDate,
    updateTask,
    deleteTask,
    toggleComplete,
} from "../controllers/task.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createTask);

router.get("/", getAllTasks);

router.get("/:date", getTasksByDate);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

router.patch("/:id/complete", toggleComplete);

export default router;