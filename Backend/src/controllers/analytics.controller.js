import Task from "../models/Task.js";

import calculateScore from "../utils/calculateScore.js";

export const dailyAnalytics = async (req, res) => {
  try {
    const date = new Date(req.params.date);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const tasks = await Task.find({
      userId: req.user._id,
      date: {
        $gte: date,
        $lt: nextDay,
      },
    });

    const totalTasks = tasks.length;

    const now = new Date();

    const completedOnTime = tasks.filter(
      (task) => task.completed && task.completedAt <= task.deadline,
    );

    const completedLate = tasks.filter(
      (task) => task.completed && task.completedAt > task.deadline,
    );

    const pending = tasks.filter(
      (task) => !task.completed && task.deadline > now,
    );

    const missed = tasks.filter(
      (task) => !task.completed && task.deadline <= now,
    );

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(
            (
              ((completedOnTime.length + completedLate.length) / totalTasks) *
              100
            ).toFixed(2),
          );

    const onTimeRate =
      totalTasks === 0
        ? 0
        : Number(((completedOnTime.length / totalTasks) * 100).toFixed(2));

    const score = calculateScore(tasks);

    res.json({
      totalTasks,

      completedOnTime: completedOnTime.length,

      completedLate: completedLate.length,

      pending: pending.length,

      missed: missed.length,

      completionRate,

      onTimeRate,

      productivityScore: score,

      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const monthlyAnalytics = async (req, res) => {
  try {
    const [year, month] = req.params.month.split("-").map(Number);

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const tasks = await Task.find({
      userId: req.user._id,
      date: {
        $gte: start,
        $lt: end,
      },
    });

    const totalTasks = tasks.length;

    const completed = tasks.filter((task) => task.completed);

    const pending = tasks.filter((task) => !task.completed);

    const late = tasks.filter(
      (task) =>
        task.completed && task.completedAt && task.completedAt > task.deadline,
    );

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(((completed.length / totalTasks) * 100).toFixed(2));

    let monthlyScore = calculateScore(tasks);

    const categoryCount = {};

    tasks.forEach((task) => {
      if (!categoryCount[task.category]) {
        categoryCount[task.category] = 0;
      }

      categoryCount[task.category]++;
    });

    const dailyScores = {};

    tasks.forEach((task) => {
      const key = task.date.toISOString().split("T")[0];

      if (!dailyScores[key]) {
        dailyScores[key] = [];
      }

      dailyScores[key].push(task);
    });

    const graph = [];

    for (const day in dailyScores) {
      graph.push({
        date: day,
        score: calculateScore(dailyScores[day]),
      });
    }

    res.json({
      totalTasks,

      completed: completed.length,

      pending: pending.length,

      late: late.length,

      completionRate,

      monthlyScore,

      categoryCount,

      graph,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const heatmapAnalytics = async (req, res) => {

    try {

        const [year, month] = req.params.month.split("-").map(Number);

        const start = new Date(year, month - 1, 1);

        const end = new Date(year, month, 1);

        const tasks = await Task.find({
            userId: req.user._id,
            date: {
                $gte: start,
                $lt: end
            }
        });

        const map = {};

        tasks.forEach(task => {

            const key = task.date.toISOString().split("T")[0];

            if (!map[key]) {
                map[key] = {
                    total: 0,
                    completed: 0,
                };
            }

            map[key].total++;

            if (task.completed) {
                map[key].completed++;
            }

        });

        const heatmap = [];

        for (const date in map) {

            heatmap.push({

                date,

                completion:
                    Number(
                        (
                            (map[date].completed /
                                map[date].total) *
                            100
                        ).toFixed(2)
                    )

            });

        }

        res.json(heatmap);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};