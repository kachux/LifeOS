"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Flame, 
  X 
} from "lucide-react";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    today: "",
    completedTodayCount: 0,
    totalHabitsCount: 0,
    todayRate: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Daily");
  const [submitting, setSubmitting] = useState(false);

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (data.habits) setHabits(data.habits);
      setSummary({
        today: data.today || new Date().toISOString().split("T")[0],
        completedTodayCount: data.completedTodayCount || 0,
        totalHabitsCount: data.totalHabitsCount || 0,
        todayRate: data.todayRate || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });
      if (res.ok) fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category }),
      });
      if (res.ok) {
        setName("");
        setShowAddModal(false);
        fetchHabits();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
      fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span>Habits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Daily checkboxes & streak counts</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Habit</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="designer-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Progress</span>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {summary.completedTodayCount} of {summary.totalHabitsCount} done
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold font-mono text-sm border border-amber-200">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{summary.todayRate}%</span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300 rounded-full"
            style={{ width: `${summary.todayRate}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="designer-card-static p-12 text-center text-xs text-slate-400">
            No habits configured yet.
          </div>
        ) : (
          habits.map((h) => {
            const isTicked = h.isCompletedToday;
            return (
              <div
                key={h.id}
                onClick={() => handleToggleHabit(h.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 group ${
                  isTicked
                    ? "bg-amber-50/40 border-amber-200/90 shadow-xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isTicked
                        ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isTicked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className={`text-xs font-bold ${isTicked ? "text-amber-950 line-through opacity-80" : "text-slate-900"}`}>
                      {h.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{h.streak || 0}d</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHabit(h.id);
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
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
              New Habit
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Habit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink 3L Water, 20m Reading"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                {submitting ? "Saving..." : "Start Habit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
