import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Map a completion percentage (0–100) to a heat colour class.
function heatClass(pct, hasTasks) {
  if (!hasTasks) return "bg-white/[0.03] border-white/5 text-muted-foreground";
  if (pct >= 80) return "bg-emerald-500/80 border-emerald-400/50 text-white";
  if (pct >= 60) return "bg-emerald-500/55 border-emerald-400/40 text-white";
  if (pct >= 40) return "bg-amber-500/55 border-amber-400/40 text-white";
  if (pct >= 1) return "bg-rose-500/50 border-rose-400/40 text-white";
  return "bg-rose-500/30 border-rose-400/30 text-white/90";
}

/**
 * Month heatmap. `year`/`month` are numbers (month is 1-based).
 * `data` is a map: { "YYYY-MM-DD": completionPercent }.
 * Clicking a day fires onSelectDay(Date).
 */
export function Heatmap({
  year,
  month,
  data = {},
  events,
  onSelectDay,
  selectedKey,
}) {
  const eventSet = events || new Set();
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = first.getDay();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2.5 text-center text-[11px] font-medium text-muted-foreground sm:gap-3">
        {WEEKDAYS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />;
          const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const pct = data[key];
          const hasTasks = pct !== undefined;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const hasEvent = eventSet.has(key);
          const date = new Date(year, month - 1, d);
          return (
            <motion.button
              key={key}
              onClick={() => onSelectDay?.(date)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.006 }}
              whileHover={{ scale: 1.18, zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
              title={
                (hasTasks ? `${pct}% complete` : "No tasks") +
                (hasEvent ? " · special event" : "")
              }
              className={cn(
                "relative grid aspect-square place-items-center rounded-lg border text-xs font-medium transition-colors",
                heatClass(pct, hasTasks),
                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isSelected && !isToday && "ring-2 ring-white/70 ring-offset-2 ring-offset-background"
              )}
            >
              {hasEvent && (
                <Star
                  className="absolute -top-1.5 -right-1.5 size-3.5 fill-none text-foreground drop-shadow"
                  strokeWidth={2}
                />
              )}
              {d}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3 text-foreground" strokeWidth={1.5} />
          Event
        </span>
        <span className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="h-3 w-3 rounded bg-white/[0.03]" />
          <span className="h-3 w-3 rounded bg-rose-500/50" />
          <span className="h-3 w-3 rounded bg-amber-500/55" />
          <span className="h-3 w-3 rounded bg-emerald-500/55" />
          <span className="h-3 w-3 rounded bg-emerald-500/80" />
          <span>More</span>
        </span>
      </div>
    </div>
  );
}
