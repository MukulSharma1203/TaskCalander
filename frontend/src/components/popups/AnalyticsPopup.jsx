import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  CheckCircle2,
  AlarmClock,
  Hourglass,
  XCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TaskItem } from "@/components/TaskItem";
import api, { errMsg } from "@/lib/api";
import { cn } from "@/lib/utils";
import { dayKey, monthKey, prettyDate, prettyDateShort } from "@/lib/date";

const CATEGORY_COLORS = [
  "#a855f7",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
];

const tooltipStyle = {
  background: "rgba(20,18,28,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
};

function StatCard({ icon: Icon, label, value, suffix, tint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={cn("grid size-7 place-items-center rounded-lg", tint)}>
          <Icon className="size-3.5" />
        </span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
        {suffix && (
          <span className="ml-0.5 text-sm text-muted-foreground">{suffix}</span>
        )}
      </p>
    </motion.div>
  );
}

// ---- Daily view --------------------------------------------------------

function DailyView({ date, setDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/analytics/day/${date}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e, "Could not load daily analytics")))
      .finally(() => setLoading(false));
  }, [date]);

  const donut = useMemo(() => {
    if (!data) return [];
    return [
      { name: "On time", value: data.completedOnTime, fill: "#10b981" },
      { name: "Late", value: data.completedLate, fill: "#f59e0b" },
      { name: "Pending", value: data.pending, fill: "#3b82f6" },
      { name: "Missed", value: data.missed, fill: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [data]);

  return (
    <div className="space-y-6">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value || dayKey(new Date()))}
        className="rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-rose-400">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Target}
              label="Total"
              value={data?.totalTasks ?? 0}
              tint="bg-primary/15 text-primary"
              delay={0.02}
            />
            <StatCard
              icon={TrendingUp}
              label="Completion"
              value={data?.completionRate ?? 0}
              suffix="%"
              tint="bg-emerald-500/15 text-emerald-300"
              delay={0.06}
            />
            <StatCard
              icon={AlarmClock}
              label="On-time"
              value={data?.onTimeRate ?? 0}
              suffix="%"
              tint="bg-sky-500/15 text-sky-300"
              delay={0.1}
            />
            <StatCard
              icon={Trophy}
              label="Score"
              value={data?.productivityScore ?? 0}
              tint="bg-fuchsia-500/15 text-fuchsia-300"
              delay={0.14}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            {/* Breakdown donut */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Task breakdown
              </p>
              {donut.length === 0 ? (
                <div className="grid h-56 place-items-center text-sm text-muted-foreground">
                  No tasks on this day.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={donut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {donut.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {donut.map((d) => (
                      <span
                        key={d.name}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ background: d.fill }}
                        />
                        {d.name} ({d.value})
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mini stat rows */}
            <div className="grid grid-cols-2 gap-3 self-start">
              <MiniStat
                icon={CheckCircle2}
                label="On time"
                value={data?.completedOnTime ?? 0}
                tint="text-emerald-300"
              />
              <MiniStat
                icon={Clock}
                label="Completed late"
                value={data?.completedLate ?? 0}
                tint="text-amber-300"
              />
              <MiniStat
                icon={Hourglass}
                label="Pending"
                value={data?.pending ?? 0}
                tint="text-sky-300"
              />
              <MiniStat
                icon={XCircle}
                label="Missed"
                value={data?.missed ?? 0}
                tint="text-rose-300"
              />
            </div>
          </div>

          {/* Tasks that day */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Tasks on {prettyDate(date)}
            </p>
            {(data?.tasks || []).length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-white/[0.02] py-8 text-center text-sm text-muted-foreground">
                No tasks scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {data.tasks.map((t, i) => (
                  <TaskItem key={t._id} task={t} index={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <Icon className={cn("size-5 shrink-0", tint)} />
      <div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ---- Monthly view ------------------------------------------------------

function MonthlyView({ month, setMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/analytics/month/${month}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e, "Could not load analytics")))
      .finally(() => setLoading(false));
  }, [month]);

  const graph = useMemo(
    () =>
      (data?.graph || [])
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((g) => ({ ...g, label: prettyDateShort(g.date) })),
    [data]
  );

  const pie = useMemo(
    () =>
      Object.entries(data?.categoryCount || {}).map(([name, value]) => ({
        name,
        value,
      })),
    [data]
  );

  return (
    <div className="space-y-6">
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value || monthKey())}
        className="rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-rose-400">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Target}
              label="Total tasks"
              value={data?.totalTasks ?? 0}
              tint="bg-primary/15 text-primary"
              delay={0.02}
            />
            <StatCard
              icon={TrendingUp}
              label="Completion"
              value={data?.completionRate ?? 0}
              suffix="%"
              tint="bg-emerald-500/15 text-emerald-300"
              delay={0.06}
            />
            <StatCard
              icon={Clock}
              label="Late"
              value={data?.late ?? 0}
              tint="bg-amber-500/15 text-amber-300"
              delay={0.1}
            />
            <StatCard
              icon={Trophy}
              label="Score"
              value={data?.monthlyScore ?? 0}
              tint="bg-fuchsia-500/15 text-fuchsia-300"
              delay={0.14}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            {/* Daily score area chart */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Daily productivity score
              </p>
              {graph.length === 0 ? (
                <div className="grid h-56 place-items-center text-sm text-muted-foreground">
                  No data for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={224}>
                  <AreaChart data={graph} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#8b8794", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b8794", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#scoreFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                By category
              </p>
              {pie.length === 0 ? (
                <div className="grid h-56 place-items-center text-sm text-muted-foreground">
                  No data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={224}>
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pie.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {pie.map((p, i) => (
                  <span
                    key={p.name}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }}
                    />
                    {p.name} ({p.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Popup shell -------------------------------------------------------

export function AnalyticsPopup({ open, onClose, initialTab = "monthly", date }) {
  const [tab, setTab] = useState(initialTab);
  const [day, setDay] = useState(dayKey(date || new Date()));
  const [month, setMonth] = useState(monthKey(date || new Date()));

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    if (date) {
      setDay(dayKey(date));
      setMonth(monthKey(date));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Analytics"
      subtitle="Your productivity, visualised."
      icon={<BarChart3 className="size-5" />}
    >
      {/* Tab switcher */}
      <div className="mb-5 inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {[
          { key: "daily", label: "Daily" },
          { key: "monthly", label: "Monthly" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === t.key && (
              <motion.span
                layoutId="analytics-tab"
                className="absolute inset-0 rounded-lg bg-primary/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "daily" ? (
            <DailyView date={day} setDate={setDay} />
          ) : (
            <MonthlyView month={month} setMonth={setMonth} />
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
