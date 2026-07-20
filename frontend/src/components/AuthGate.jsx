import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errMsg } from "@/lib/api";

export function AuthGate() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(errMsg(err, "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card/70 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">TaskCalendar</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Plan your days, track your streaks.
          </p>
        </div>

        {/* Mode switch */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-white/[0.02] p-1">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className="relative rounded-lg py-2 text-sm font-medium capitalize transition-colors"
            >
              {mode === m && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-0 rounded-lg bg-primary/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={
                  mode === m
                    ? "relative text-primary"
                    : "relative text-muted-foreground"
                }
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === "register" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Ada Lovelace"
                  value={form.name}
                  onChange={set("name")}
                  required={mode === "register"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-rose-400"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
