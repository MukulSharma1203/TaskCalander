import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  BarChart3,
  CalendarDays,
  LogOut,
  Flame,
  Trophy,
  CheckCircle2,
  ListTodo,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api, { errMsg } from "@/lib/api";
import { cn } from "@/lib/utils";
import { monthKey, dayKey, prettyDateShort, isSameDay } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heatmap } from "@/components/Heatmap";
import { TaskItem } from "@/components/TaskItem";
import { IconDock } from "@/components/IconDock";
import { TaskPopup } from "@/components/popups/TaskPopup";
import { AnalyticsPopup } from "@/components/popups/AnalyticsPopup";
import { DayPopup } from "@/components/popups/DayPopup";

function StatTile({ icon: Icon, label, value, suffix, tint, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-card/50 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("grid size-8 place-items-center rounded-xl", tint)}>
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
        {suffix && (
          <span className="ml-1 text-base text-muted-foreground">{suffix}</span>
        )}
      </p>
    </motion.div>
  );
}

// Small round "+" button used in card headers to add an event/task for a day.
function AddButton({ label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.12, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
    >
      <Plus className="size-4" />
    </motion.button>
  );
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Popup state. `selectedDate` is the day the DayPopup / TaskPopup act on.
  const [taskOpen, setTaskOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [dayAddTask, setDayAddTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [events, setEvents] = useState(new Set());

  const load = useCallback(async () => {
    try {
      // Dashboard summary + the month's calendar days (for special-event markers)
      // in parallel.
      const [dash, cal] = await Promise.all([
        api.get(`/dashboard/${monthKey(now)}`),
        api
          .get(`/calendar/${month}?year=${year}`)
          .then((r) => r.data)
          .catch(() => []),
      ]);
      setData(dash.data);
      setEvents(
        new Set(
          (cal || [])
            .filter((d) => d.specialEvent)
            .map((d) => dayKey(d.date))
        )
      );
      setError("");
    } catch (e) {
      setError(errMsg(e, "Could not load dashboard"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Build heatmap map { "YYYY-MM-DD": completion } from dashboard payload.
  const heatData = {};
  (data?.heatmap || []).forEach((h) => {
    heatData[h.date] = h.completion;
  });

  // Average of the per-day completion rates across days that had tasks.
  const heatValues = Object.values(heatData);
  const monthAvg = heatValues.length
    ? Math.round(heatValues.reduce((a, b) => a + b, 0) / heatValues.length)
    : 0;

  const summary = data?.summary || {};
  const todayTasks = data?.todayTasks || [];
  const todayDone = todayTasks.filter((t) => t.completed).length;

  // Open the full day view for a date.
  const openDay = (date, addTask = false) => {
    setSelectedDate(date);
    setDayAddTask(addTask);
    setDayOpen(true);
  };

  // Open the quick add-task popup for the currently selected day.
  const openAddTask = () => {
    setTaskOpen(true);
  };

  const toggleToday = async (t) => {
    // Update the tick and every derived stat (streak, completion, averages) in
    // one go: persist, refetch, then repaint once — so nothing lags behind.
    try {
      await api.patch(`/tasks/${t._id}/complete`);
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const selectedIsToday = isSameDay(selectedDate, new Date());

  const dockItems = [
    {
      key: "add",
      label: selectedIsToday
        ? "Add task for today"
        : `Add task for ${prettyDateShort(selectedDate)}`,
      icon: Plus,
      accent: true,
      onClick: openAddTask,
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: BarChart3,
      accent: true,
      onClick: () => setAnalyticsOpen(true),
    },
    {
      key: "today",
      label: "Day details",
      icon: CalendarDays,
      accent: true,
      onClick: () => openDay(selectedDate),
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {new Date(year, month - 1).toLocaleString(undefined, {
                  month: "long",
                })}{" "}
                {year}
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="text-muted-foreground">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </motion.header>

        {loading ? (
          <div className="flex justify-center py-32 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatTile
                icon={ListTodo}
                label="Total tasks"
                value={summary.totalTasks ?? 0}
                tint="bg-primary/15 text-primary"
                delay={0.04}
              />
              <StatTile
                icon={CheckCircle2}
                label="Completed"
                value={summary.completed ?? 0}
                tint="bg-emerald-500/15 text-emerald-300"
                delay={0.08}
              />
              <StatTile
                icon={Flame}
                label="Current streak"
                value={summary.currentStreak ?? 0}
                suffix="d"
                tint="bg-orange-500/15 text-orange-300"
                delay={0.12}
              />
              <StatTile
                icon={Trophy}
                label="Longest streak"
                value={summary.longestStreak ?? 0}
                suffix="d"
                tint="bg-amber-500/15 text-amber-300"
                delay={0.16}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Heatmap card */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 24 }}
                className="rounded-3xl border border-white/5 bg-card/50 p-6 backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold tracking-tight">Activity</h2>
                    <p className="text-xs text-muted-foreground">
                      Tap any day to view or plan it
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {selectedIsToday ? "Today" : prettyDateShort(selectedDate)}:{" "}
                      {heatData[dayKey(selectedDate)] ?? 0}%
                    </Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Avg {monthAvg}%
                    </Badge>
                    <AddButton
                      label="Add event for a day"
                      onClick={() => openDay(selectedDate)}
                    />
                  </div>
                </div>
                <Heatmap
                  year={year}
                  month={month}
                  data={heatData}
                  events={events}
                  selectedKey={dayKey(selectedDate)}
                  onSelectDay={(d) => {
                    setSelectedDate(d);
                    openDay(d);
                  }}
                />
              </motion.section>

              {/* Today's tasks — absolutely filling its cell so the calendar
                  card dictates the row height and this list scrolls inside. */}
              <div className="relative min-h-[24rem]">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, type: "spring", stiffness: 240, damping: 24 }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card/50 p-6 backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold tracking-tight">Today</h2>
                    <span className="text-xs text-muted-foreground">
                      {todayDone}/{todayTasks.length} done
                    </span>
                  </div>
                  <AddButton
                    label="Add event / task for today"
                    onClick={() => openDay(new Date(), true)}
                  />
                </div>

                {data?.todayEvent?.specialEvent && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                    <Sparkles className="size-4 shrink-0" />
                    {data.todayEvent.specialEvent}
                  </div>
                )}

                {todayTasks.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nothing scheduled today.
                    </p>
                    <Button size="sm" onClick={() => openDay(new Date(), true)}>
                      <Plus className="size-4" />
                      Add a task
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {todayTasks.map((t, i) => (
                        <TaskItem
                          key={t._id}
                          task={t}
                          index={i}
                          onToggle={toggleToday}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.section>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating dock */}
      <IconDock items={dockItems} />

      {/* Popups — layered above everything */}
      <TaskPopup
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        day={selectedDate}
        onChanged={load}
      />
      <AnalyticsPopup open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <DayPopup
        open={dayOpen}
        onClose={() => setDayOpen(false)}
        date={selectedDate}
        initialAddTask={dayAddTask}
        onChanged={load}
      />
    </div>
  );
}
