import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Dashboard } from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

export default function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <Toaster theme="dark" position="top-center" richColors />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen items-center justify-center text-muted-foreground"
          >
            <Loader2 className="size-8 animate-spin" />
          </motion.div>
        ) : user ? (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuthGate />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
