import Task from "../models/Task.js";
import CalendarDay from "../models/CalendarDay.js";

const dashboard = async (req, res) => {
  try {
    const [year, month] = req.params.month.split("-").map(Number);

    const monthStart = new Date(year, month - 1, 1);

    const monthEnd = new Date(year, month, 1);

    const today = new Date();

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
