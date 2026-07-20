const getCategories = (req, res) => {

    res.json([
        "Study",
        "Coding",
        "Workout",
        "Reading",
        "Work",
        "Personal",
        "Shopping",
        "Other"
    ]);

};

export { getCategories };