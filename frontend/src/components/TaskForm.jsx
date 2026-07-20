import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSlider } from "@/components/ui/time-slider";
import { CATEGORIES, PRIORITIES } from "@/lib/constants";
import { defaultTime, timeInput } from "@/lib/date";

// A task form WITHOUT a date field — the date is supplied by whichever day the
// user is looking at. The only time control is the "finish by" time.
const emptyForm = (day) => ({
  title: "",
  description: "",
  time: defaultTime(day),
  category: "Other",
  priority: "Medium",
});

const fromTask = (t) => ({
  title: t.title,
  description: t.description || "",
  time: timeInput(t.deadline),
  category: t.category || "Other",
  priority: t.priority || "Medium",
});

export function TaskForm({ day, editing, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(emptyForm(day));
  const [error, setError] = useState("");

  // Reset when switching between add/edit or changing the target day.
  useEffect(() => {
    setError("");
    setForm(editing ? fromTask(editing) : emptyForm(day));
  }, [editing, day]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.time) {
      setError("Pick a finish time.");
      return;
    }
    setError("");
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Finish the frontend"
          value={form.title}
          onChange={set("title")}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          placeholder="Optional details…"
          value={form.description}
          onChange={set("description")}
        />
      </div>

      <TimeSlider value={form.time} onChange={(v) => set("time")(v)} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={set("category")}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={set("priority")}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {editing ? "Save changes" : "Add task"}
        </Button>
        {editing && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
