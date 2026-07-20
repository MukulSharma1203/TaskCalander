# 📅 TaskCalendar

A full-stack productivity calendar that turns your to-do list into measurable progress. Plan tasks for any day, mark special events, and watch your consistency build through a completion heatmap, streaks, and daily/monthly analytics.

Built with a **React 19 + Vite** frontend (Tailwind CSS v4, shadcn/ui, Framer Motion) and an **Express + MongoDB** backend with JWT authentication.

---

## ✨ Features

- **Single-page dark UI** with smooth, animated popups layered above the interface (Framer Motion + shadcn/ui).
- **Day planning** — add, edit, complete, and delete tasks for any past, present, or future day. Tasks auto-attach to the selected day; you only pick a finish time via an animated slider (hour / minute / AM–PM).
- **Completion heatmap** — a month grid coloured by each day's completion rate, with ⭐ markers on days that have a special event. Click any day to open it.
- **Special events & notes** — attach an event and freeform notes to any calendar day.
- **Analytics** — separate **Daily** and **Monthly** views:
  - Daily: completion rate, on-time rate, productivity score, and a task breakdown (on-time / late / pending / missed).
  - Monthly: daily-score trend chart, category breakdown, and monthly score.
- **Streaks & summaries** — current streak, longest streak, total/completed counts, and month-average completion.
- **Optimistic, animated task ticking** — a left-to-right strikethrough sweep gives instant feedback while the update persists.
- **JWT authentication** — register / login with per-user data isolation.

---

## 🛠 Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- Framer Motion (animations)
- Recharts (analytics charts)
- Axios, lucide-react, Sonner

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + bcrypt
- CORS, cookie-parser, dotenv

---

## 📂 Project Structure

```
TaskCalander/
├── Backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # auth, task, calendar, analytics, dashboard, category
│   │   ├── middleware/     # JWT auth guard
│   │   ├── models/         # User, Task, CalendarDay
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # token generation, score calculation
│   │   ├── app.js          # Express app + middleware
│   │   └── index.js        # server entry
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/      # Dashboard, Heatmap, popups, shared UI (shadcn)
    │   ├── context/         # AuthContext
    │   ├── lib/             # api client, date helpers, constants
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or MongoDB Atlas)

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env      # then fill in the values
npm run dev               # starts on http://localhost:5000
```

**`Backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
# Comma-separated allowlist of frontend origins (leave unset for permissive local dev)
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # then set the API URL
npm run dev               # starts on http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

Open the dev URL, register an account, and start planning.

---

## 🔌 API Reference

All routes are prefixed with `/api`. Every route except `register` / `login` requires an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`
| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| POST   | `/register`  | Create an account, returns a token |
| POST   | `/login`     | Log in, returns a token            |
| GET    | `/me`        | Get the current user               |

### Tasks — `/api/tasks`
| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| POST   | `/`               | Create a task                   |
| GET    | `/`               | List all of the user's tasks    |
| GET    | `/:date`          | Tasks for a specific day        |
| PUT    | `/:id`            | Update a task                   |
| DELETE | `/:id`            | Delete a task                   |
| PATCH  | `/:id/complete`   | Toggle completion (atomic)      |

### Calendar — `/api/calendar`
| Method | Endpoint         | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/:month`        | Calendar days for a month (`?year=YYYY`) |
| GET    | `/day/:date`     | A single day's event / notes             |
| PUT    | `/day/:date`     | Create or update a day's event / notes   |

### Analytics — `/api/analytics`
| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| GET    | `/day/:date`      | Daily analytics                |
| GET    | `/month/:month`   | Monthly analytics              |
| GET    | `/heatmap/:month` | Month completion heatmap data  |

### Dashboard — `/api/dashboard`
| Method | Endpoint    | Description                                             |
|--------|-------------|--------------------------------------------------------|
| GET    | `/:month`   | Today's tasks/event, month summary, streaks, heatmap   |

### Categories — `/api/categories`
| Method | Endpoint | Description                    |
|--------|----------|--------------------------------|
| GET    | `/`      | List available task categories |

**Task fields:** `title`, `description`, `date`, `deadline`, `category` (Study, Coding, Workout, Reading, Work, Personal, Shopping, Other), `priority` (Low, Medium, High), `completed`, `completedAt`.

---

## 📊 How Scoring Works

Each completed task earns points: **+10** for completion, **+5** if finished on time (**−3** if late), and **+2** for high-priority tasks. Daily completion ≥ **70%** counts toward streaks.

---

## 🚢 Deployment Notes

- Set `CLIENT_URL` on the backend to your deployed frontend origin(s) so CORS allows it.
- Set `VITE_API_URL` to your deployed backend's `/api` URL **before** building the frontend (`npm run build`).
- Keep `.env` files out of version control (already gitignored); use `.env.example` as the template.
- The JWT is stored in `localStorage` — standard for this token-in-body setup, but readable by JS. Consider httpOnly cookies if you need stricter XSS protection.

---

## 📄 License

ISC
