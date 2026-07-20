import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Parse "HH:MM" (24h) into { hour12, minute, meridiem }.
function parse(value) {
  const [hStr, mStr] = (value || "23:59").split(":");
  let h = Number(hStr);
  const minute = Number(mStr) || 0;
  const meridiem = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, meridiem };
}

// Build "HH:MM" (24h) from the 12h parts.
function build(hour12, minute, meridiem) {
  let h = hour12 % 12;
  if (meridiem === "PM") h += 12;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(minute)}`;
}

function Track({ label, value, min, max, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-sm font-semibold text-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative flex h-6 items-center">
        {/* Filled track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-clean relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

/**
 * Time picker built from sliders: hour (1–12), minute (0–59), and an AM/PM
 * toggle. Reads/writes a 24-hour "HH:MM" string via value/onChange.
 */
export function TimeSlider({ value, onChange }) {
  const { hour12, minute, meridiem } = useMemo(() => parse(value), [value]);

  const setHour = (h) => onChange(build(h, minute, meridiem));
  const setMinute = (m) => onChange(build(hour12, m, meridiem));
  const setMeridiem = (mer) => onChange(build(hour12, minute, mer));

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Finish by</span>
        <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
          {hour12}:{String(minute).padStart(2, "0")}{" "}
          <span className="text-primary">{meridiem}</span>
        </span>
      </div>

      <Track label="Hour" value={hour12} min={1} max={12} onChange={setHour} />
      <Track
        label="Minute"
        value={minute}
        min={0}
        max={59}
        onChange={setMinute}
        format={(v) => String(v).padStart(2, "0")}
      />

      <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-white/[0.03] p-1">
        {["AM", "PM"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMeridiem(m)}
            className="relative rounded-md py-1.5 text-sm font-medium transition-colors"
          >
            {meridiem === m && (
              <motion.span
                layoutId="meridiem-pill"
                className="absolute inset-0 rounded-md bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10",
                meridiem === m
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {m}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
