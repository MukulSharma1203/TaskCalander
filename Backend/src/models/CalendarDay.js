import mongoose from "mongoose";

const calendarDaySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        specialEvent: {
            type: String,
            default: "",
            trim: true,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("CalendarDay", calendarDaySchema);