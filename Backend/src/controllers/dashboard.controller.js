import Task from "../models/Task.js";
import CalendarDay from "../models/CalendarDay.js";

const dashboard = async (req, res) => {
  try {
    const [year, month] = req.params.month.split("-").map(Number);

    // Task `date` values are stored at UTC midnight of the user's calendar day,
    // so every range here is built in UTC to match. The server's own timezone
    // (UTC on Render, local on a dev machine) must not influence the result.
    const monthStart = new Date(Date.UTC(year, month - 1, 1));

    const monthEnd = new Date(Date.UTC(year, month, 1));

    // "Today" is the client's calendar day, passed as ?today=YYYY-MM-DD, since
    // the server can't know the user's timezone. Fall back to the server's UTC
    // day if it's missing.
    const now = new Date();
    const todayKey =
      req.query.today ||
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    const todayStart = new Date(`${todayKey}T00:00:00.000Z`);

    const tomorrow = new Date(todayStart);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const monthTasks = await Task.find({
      userId: req.user._id,
      date: {
        $gte: monthStart,
        $lt: monthEnd,
      },
    });

    const todayTasks = await Task.find({
      userId: req.user._id,
      date: {
        $gte: todayStart,
        $lt: tomorrow,
      },
    });

    const todayEvent = await CalendarDay.findOne({
      userId: req.user._id,
      date: {
        $gte: todayStart,
        $lt: tomorrow,
      },
    });

    const totalTasks = monthTasks.length;

    const completed = monthTasks.filter((task) => task.completed).length;

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(((completed / totalTasks) * 100).toFixed(2));

    const heatmap = {};

    monthTasks.forEach((task) => {
      const key = task.date.toISOString().split("T")[0];

      if (!heatmap[key]) {
        heatmap[key] = {
          total: 0,
          completed: 0,
        };
      }

      heatmap[key].total++;

      if (task.completed) heatmap[key].completed++;
    });

    const heatmapData = [];

    for (const date in heatmap) {
      heatmapData.push({
        date,

        completion: Number(
          ((heatmap[date].completed / heatmap[date].total) * 100).toFixed(2),
        ),
      });
    }

    heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let running = 0;

    for (const day of heatmapData) {
      if (day.completion >= 70) {
        running++;

        longestStreak = Math.max(longestStreak, running);
      } else {
        running = 0;
      }
    }

    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].completion >= 70) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      todayTasks,

      todayEvent,

      summary: {
        totalTasks,

        completed,

        completionRate,

        currentStreak,

        longestStreak,
      },

      heatmap: heatmapData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export default dashboard;
