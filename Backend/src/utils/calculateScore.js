const calculateScore = (tasks) => {

    let score = 0;

    tasks.forEach(task => {

        if (!task.completed) {
            return;
        }

        score += 10;

        if (task.completedAt <= task.deadline) {
            score += 5;
        } else {
            score -= 3;
        }

        if (task.priority === "High") {
            score += 2;
        }

    });

    return Math.max(score, 0);
};

export default calculateScore;