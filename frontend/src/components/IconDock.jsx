import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Floating icon dock. Each item is { key, label, icon: Component, onClick }.
 * Animated hover lift + tooltip label. Sits fixed bottom-centre above the UI.
 */
export function IconDock({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-card/70 p-2 shadow-2xl backdrop-blur-2xl">
        {items.map(({ key, label, icon: Icon, onClick, accent }) => (
          <motion.button
            key={key}
            onClick={onClick}
            whileHover={{ y: -6, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="group relative grid h-12 w-12 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label={label}
          >
            <Icon className="size-5" />
            <span
              className={cn(
                "pointer-events-none absolute -top-9 whitespace-nowrap rounded-lg bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              )}
            >
              {label}
            </span>
            {accent && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
