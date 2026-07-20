import Task from "../models/Task.js";

export const createTask = async (req, res) => {
    try {

        const {
            title,
            description,
            date,
            deadline,
            category,
            priority,
        } = req.body;

        if (!title || !date || !deadline) {
            return res.status(400).json({
                message: "Title, date and deadline are required."
            });
        }

        const task = await Task.create({
            userId: req.user._id,
            title,
            description,
            date,
            deadline,
            category,
            priority,
        });

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getAllTasks = async (req, res) => {

    try {

        const tasks = await Task.find({
            userId: req.user._id
        }).sort({ deadline: 1 });

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const getTasksByDate = async (req, res) => {

    try {

        const date = new Date(req.params.date);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const tasks = await Task.find({
            userId: req.user._id,
            date: {
                $gte: date,
                $lt: nextDay
            }
        }).sort({ deadline: 1 });

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const updateTask = async (req, res) => {

    try {

        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        Object.assign(task, req.body);

        await task.save();

        res.json(task);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const deleteTask = async (req, res) => {

    try {

        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        await task.deleteOne();

        res.json({
            message: "Task deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const toggleComplete = async (req, res) => {

    try {

        // Toggle atomically in a single round-trip using an aggregation-pipeline
        // update: flip `completed` and set `completedAt` from the new value.
        // This avoids the previous findOne + save (two round-trips).
        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            [
                { $set: { completed: { $not: ["$completed"] } } },
                {
                    $set: {
                        completedAt: {
                            $cond: ["$completed", "$$NOW", null]
                        }
                    }
                }
            ],
            { new: true, updatePipeline: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};