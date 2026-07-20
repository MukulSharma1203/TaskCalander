import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CalendarDays, Loader2, Save, Sparkles, Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import api, { errMsg } from "@/lib/api";
import { dayKey, dateFieldISO, deadlineISO, prettyDate, isSameDay } from "@/lib/date";

// Full day view: manage tasks for ANY day (past/present/future) plus the day's
// special event and notes. `initialAddTask` opens straight into the add form.
export function DayPopup({ open, onClose, date, initialAddTask = false, onChanged }) {
  const target = date || new Date();
  const [tasks, setTasks] = useState([]);
  const [specialEvent, setSpecialEvent] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingDay, setSavingDay] = useState(false);
  const [error, setError] = useState("");

  const key = dayKey(target);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [taskList, day] = await Promise.all([
        api.get(`/tasks/${key}`).then((r) => r.data).catch(() => []),
        api.get(`/calendar/day/${key}`).then((r) => r.data).catch(() => null),
      ]);
      setTasks(taskList || []);
      setSpecialEvent(day?.specialEvent || "");
      setNotes(day?.notes || "");
    } catch (e) {
      setError(errMsg(e, "Could not load this day"));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setShowForm(initialAddTask);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key]);

  const submitTask = async (form) => {
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
      setShowForm(false);
      await load();
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
      await load({ silent: true });
      onChanged?.();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (t) => {
    // Remove the row in place so the list doesn't flash a spinner reload.
    setTasks((list) => list.filter((x) => x._id !== t._id));
    if (editing?._id === t._id) setEditing(null);
    try {
      await api.delete(`/tasks/${t._id}`);
      onChanged?.();
    } catch (e) {
      setError(errMsg(e));
      load({ silent: true }); // restore true list on failure
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setShowForm(true);
  };

  const saveDay = async () => {
    setSavingDay(true);
    setError("");
    try {
      await api.put(`/calendar/day/${key}`, { specialEvent, notes });
      onChanged?.();
    } catch (e) {
      setError(errMsg(e, "Could not save"));
    } finally {
      setSavingDay(false);
    }
  };

  const done = tasks.filter((t) => t.completed).length;
  const today = isSameDay(target, new Date());

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={prettyDate(target)}
      subtitle={
        today
          ? "Today"
          : tasks.length
            ? `${done}/${tasks.length} tasks done`
            : "Plan this day"
      }
      icon={<CalendarDays className="size-5" />}
    >
      {loading ? (
        <div className="flex justify-center py-14 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tasks
                <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-xs">
                  {done}/{tasks.length}
                </span>
              </p>
              <Button
                size="sm"
                variant={showForm ? "ghost" : "secondary"}
                onClick={() => {
                  setEditing(null);
                  setShowForm((s) => !s);
                }}
              >
                {showForm && !editing ? (
                  <>
                    <X className="size-4" /> Close
                  </>
                ) : (
                  <>
                    <Plus className="size-4" /> Add task
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence initial={false} mode="wait">
              {showForm && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <TaskForm
                    day={target}
                    editing={editing}
                    onSubmit={submitTask}
                    onCancel={() => {
                      setEditing(null);
                      setShowForm(false);
                    }}
                    saving={saving}
                  />
                </div>
              )}
            </AnimatePresence>

            {tasks.length === 0 && !showForm ? (
              <p className="rounded-xl border border-white/5 bg-white/[0.02] py-8 text-center text-sm text-muted-foreground">
                Nothing scheduled for this day.
              </p>
            ) : (
              <div className="space-y-2 md:max-h-[22rem] md:overflow-y-auto md:pr-1">
                <AnimatePresence initial={false}>
                  {tasks.map((t, i) => (
                    <TaskItem
                      key={t._id}
                      task={t}
                      index={i}
                      editing={editing?._id === t._id}
                      onToggle={toggle}
                      onEdit={startEdit}
                      onDelete={remove}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right: event + notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event" className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Special event
              </Label>
              <Input
                id="event"
                placeholder="Birthday, launch day, holiday…"
                value={specialEvent}
                onChange={(e) => setSpecialEvent(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Anything you want to remember about this day…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button onClick={saveDay} disabled={savingDay} className="w-full">
              {savingDay ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save event & notes
            </Button>

            {error && (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
