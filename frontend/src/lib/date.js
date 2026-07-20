// Date helpers shared across popups.
// The backend queries tasks/calendar by `new Date(req.params.date)` (UTC
// midnight) and ranges to the next day, so we key days by their calendar
// Y-M-D and anchor the stored `date` to UTC midnight of that key to stay
// consistent with those range queries.

const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD" for a Date, using its local calendar day.
export const dayKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

// "YYYY-MM" month key.
export const monthKey = (d = new Date()) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
};

// The ISO string stored in a task's `date` field — UTC midnight of the day,
// matching how the backend filters by date range.
export const dateFieldISO = (d) =>
  new Date(`${dayKey(d)}T00:00:00.000Z`).toISOString();

// Combine a day + "HH:MM" time into a deadline ISO timestamp (local time).
export const deadlineISO = (d, time) =>
  new Date(`${dayKey(d)}T${time || "23:59"}`).toISOString();

// "HH:MM" for a Date (local), for populating a time input.
export const timeInput = (d) => {
  const dt = new Date(d);
  return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

// A sensible default deadline time: an hour from now if the day is today,
// otherwise end of the working day.
export const defaultTime = (d) => {
  const day = new Date(d);
  const today = new Date();
  const isToday = dayKey(day) === dayKey(today);
  if (isToday) {
    const t = new Date(today.getTime() + 60 * 60 * 1000);
    return timeInput(t);
  }
  return "18:00";
};

export const prettyDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const prettyDateShort = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export const isSameDay = (a, b) => dayKey(a) === dayKey(b);
