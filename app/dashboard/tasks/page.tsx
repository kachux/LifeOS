"use client";

import { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  X 
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          dueDate: dueDate ? dueDate : null,
        }),
      });
      setTitle("");
      setDueDate("");
      setShowAddModal(false);
      fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    try {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE";
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "PENDING") return t.status !== "DONE";
    if (filter === "COMPLETED") return t.status === "DONE";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== "DONE").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <CheckSquare className="w-5 h-5" />
            </span>
            <span>Tasks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Deadlines & 1-click completion</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* Task Queue Container */}
      <div className="designer-card-static p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "PENDING" ? "bg-slate-900 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === "COMPLETED" ? "bg-emerald-600 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No tasks in this list.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((t) => {
              const isDone = t.status === "DONE";
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all group ${
                    isDone
                      ? "bg-slate-50/60 border-slate-100 opacity-60"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(t)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "border-slate-300 bg-white hover:border-rose-500"
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3 h-3" />}
                    </button>

                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {t.title}
                      </div>

                      {t.dueDate && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isDone
                        ? "bg-slate-100 text-slate-400"
                        : t.isOverdue
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : t.isToday
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {t.countdownText}
                    </span>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 animate-fade-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 font-heading">
              New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study chapter 3, File taxes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                {submitting ? "Saving..." : "Add Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
