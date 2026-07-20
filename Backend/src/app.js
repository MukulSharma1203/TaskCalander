import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import categoryRoutes from "./routes/category.routes.js";

const app = express();

// Allowed origins come from CLIENT_URL (comma-separated). When unset (e.g. local
// dev) we reflect the request origin so any localhost port works.
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (no origin) and, when no allowlist is
            // configured, any origin.
            if (!origin || allowedOrigins.length === 0) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/calendar", calendarRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.send("Backend Running");
});



export default app;