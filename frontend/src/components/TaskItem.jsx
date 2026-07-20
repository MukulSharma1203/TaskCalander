import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_STYLES } from "@/lib/constants";

// A single task row. `onEdit`/`onDelete` are optional — omit them for a
// read-only list. Shows the deadline time, category and priority.
//
// The tick feels instant even though the server write takes a round-trip: the
// checkbox and a left-to-right strikethrough animate off a LOCAL `done` state
// that flips immediately on click, then reconciles with the real `completed`
// value when the server refetch lands.
export function TaskItem({ task, index = 0, editing, onToggle, onEdit, onDelete }) {
  const [done, setDone] = useState(task.completed);

  // Reconcile with server truth whenever the prop changes (refetch, or revert
  // on failure).
  useEffect(() => {
    setDone(task.completed);
  }, [task.completed]);

  const time = new Date(task.deadline).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleToggle = () => {
    setDone((d) => !d); // instant visual flip
    onToggle?.(task); // fire the (slower) server update underneath
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]",
        editing && "border-primary/40 bg-primary/5"
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-white/20 hover:border-primary"
        )}
        aria-label="Toggle complete"
      >
        <motion.span
          initial={false}
          animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          <Check className="size-3.5" />
        </motion.span>
      </button>

      <button
        onClick={() => onEdit?.(task)}
        disabled={!onEdit}
        className={cn("min-w-0 flex-1 text-left", onEdit && "cursor-pointer")}
      >
        <span className="relative inline-block max-w-full align-bottom">
          <span
            className={cn(
              "block truncate text-sm font-medium transition-colors duration-300",
              done && "text-muted-foreground"
            )}
          >
            {task.title}
          </span>
          {/* Animated strikethrough — grows left→right on complete, retracts on undo. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current"
            initial={false}
            animate={{ scaleX: done ? 1 : 0 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-[10px]", PRIORITY_STYLES[task.priority])}
          >
            {task.priority}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {task.category} · {time}
          </span>
        </div>
      </button>

      {onDelete && (
        <button
          onClick={() => onDelete(task)}
          className="text-muted-foreground opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </motion.div>
  );
}
