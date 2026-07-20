import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Motion-powered modal popup. Renders into a portal and layers above the whole
 * UI (z-[100]) with a blurred backdrop. Spring scale + fade on enter/exit.
 *
 * Pass `title` / `subtitle` / `icon` (a React element) to render the standard
 * header, or omit them and render your own header inside `children`.
 */
export function Modal({
  open,
  onClose,
  children,
  className,
  title,
  subtitle,
  icon,
  size = "lg",
}) {
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "relative z-[101] max-h-[90vh] w-full overflow-hidden rounded-3xl border border-border bg-card/80 shadow-2xl backdrop-blur-2xl",
              sizes[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.9 }}
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-fuchsia-500/15 blur-3xl" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative max-h-[90vh] overflow-y-auto">
              {title && (
                <div className="flex items-start gap-3 border-b border-border/60 p-6 pb-5">
                  {icon && (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                      {icon}
                    </div>
                  )}
                  <div className="pr-8">
                    <h2
                      id={titleId}
                      className="text-lg font-semibold tracking-tight text-foreground"
                    >
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
