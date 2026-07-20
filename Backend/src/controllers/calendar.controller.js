import CalendarDay from "../models/CalendarDay.js";

export const getMonth = async (req, res) => {

    try {

        const month = Number(req.params.month);

        const year = Number(req.query.year);

        const start = new Date(year, month - 1, 1);

        const end = new Date(year, month, 1);

        const days = await CalendarDay.find({
            userId: req.user._id,
            date: {
                $gte: start,
                $lt: end
            }
        });

        res.json(days);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const getDay = async (req, res) => {

    try {

        const date = new Date(req.params.date);

        const next = new Date(date);
        next.setDate(next.getDate() + 1);

        const day = await CalendarDay.findOne({
            userId: req.user._id,
            date: {
                $gte: date,
                $lt: next
            }
        });

        res.json(day);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const updateDay = async (req, res) => {

    try {

        const { specialEvent, notes } = req.body;

        const date = new Date(req.params.date);

        let day = await CalendarDay.findOne({
            userId: req.user._id,
            date
        });

        if (!day) {

            day = await CalendarDay.create({
                userId: req.user._id,
                date,
                specialEvent,
                notes
            });

        } else {

            day.specialEvent = specialEvent;
            day.notes = notes;

            await day.save();
        }

        res.json(day);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};