import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        deadline: {
            type: Date,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "Study",
                "Coding",
                "Workout",
                "Reading",
                "Work",
                "Personal",
                "Shopping",
                "Other",
            ],
            default: "Other",
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },

        completed: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Every list/analytics/dashboard query filters by userId and a date range,
// so index that pair. Without it those queries are full collection scans.
taskSchema.index({ userId: 1, date: 1 });

export default mongoose.model("Task", taskSchema);