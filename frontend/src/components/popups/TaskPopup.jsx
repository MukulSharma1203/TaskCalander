import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, Loader2, CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import api, { errMsg } from "@/lib/api";
import { dayKey, dateFieldISO, deadlineISO, prettyDate, isSameDay } from "@/lib/date";

// Day-scoped task manager. The date comes from `day` (defaults to today) — the
// form only asks for a finish time. Lists that day's tasks with edit/delete.
export function TaskPopup({ open, onClose, day, onChanged }) {
  // Anchor to a stable value keyed by the calendar day so effects/callbacks
  // don't churn when a fresh `new Date()` object is created each render.
  const target = useMemo(() => day || new Date(), [day]);
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/tasks/${dayKey(target)}`);
      setTasks(data);
      setError("");
    } catch (e) {
      setError(errMsg(e, "Could not load tasks"));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [target]);

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dayKey(target)]);

  const handleSubmit = async (form) => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        date: dateFieldISO(target),
        deadline: deadlineISO(target, form.time),
        category: form.category,
        priority: form.priority,
      };
      if (editing) {
        await api.put(`/tasks/${editing._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      setEditing(null);
      await loadTasks();
      onChanged?.();
    } catch (e) {
      setError(errMsg(e, "Could not save task"));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t) => {
    // Update the server first, then refetch — so the checkbox and the derived
    // counts all repaint together in one go rather than at different moments.
    try {
      await api.patch(`/tasks/${t._id}/complete`);
      await loadTasks({ silent: true });
      onChanged?.();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (t) => {
    // Remove the row from local state right away so the list updates in place
    // (no spinner reload), then confirm with the server and reconcile silently.
    setTasks((prev) => prev.filter((x) => x._id !== t._id));
    if (editing?._id === t._id) setEditing(null);
    try {
      await api.delete(`/tasks/${t._id}`);
      onChanged?.();
    } catch (e) {
      setError(errMsg(e));
      loadTasks({ silent: true }); // restore server truth if the delete failed
    }
  };

  const today = isSameDay(target, new Date());

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "New task"}
      subtitle={`${today ? "Today · " : ""}${prettyDate(target)}`}
      icon={<Plus className="size-5" />}
      size="xl"
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-stretch">
        <div>
          <TaskForm
            day={target}
            editing={editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
          {error && (
            <p className="mt-3 text-sm text-rose-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Tasks for this day */}
        <div className="flex min-h-0 flex-col md:h-full md:max-h-[32rem]">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            Tasks this day
            <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs">
              {tasks.length}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="flex-1 py-10 text-center text-sm text-muted-foreground">
              No tasks for this day yet.
            </p>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {tasks.map((t, i) => (
                  <TaskItem
                    key={t._id}
                    task={t}
                    index={i}
                    editing={editing?._id === t._id}
                    onToggle={toggle}
                    onEdit={setEditing}
                    onDelete={remove}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
