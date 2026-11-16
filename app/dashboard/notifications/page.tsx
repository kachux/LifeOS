"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Wallet
} from "lucide-react";

export default function NotificationsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/finance").then((r) => r.json()),
    ]).then(([t, h, f]) => {
      if (t.tasks) setTasks(t.tasks);
      if (h.habits) setHabits(h.habits);
      if (f) setFinance(f);
    });
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingHighTasks = tasks.filter((t) => t.status !== "DONE" && t.priority === "HIGH");
  const uncheckedHabits = habits.filter(
    (h) => !h.logs?.some((l: any) => l.date === todayStr && l.completed)
  );

  const hasAnyNotification = pendingHighTasks.length > 0 || uncheckedHabits.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          <span>Notifications & Reminders</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time alerts for pending tasks, habit streaks, and financial status.
        </p>
      </div>

      {!hasAnyNotification && habits.length === 0 && tasks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-heading">All clear!</h3>
          <p className="text-xs text-slate-400">
            No pending alerts or notifications. You are all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Habit streak alert */}
          {uncheckedHabits.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-heading">
                    {uncheckedHabits.length} Habit(s) Need Check-In
                  </h4>
                  <p className="text-xs text-slate-300">
                    "{uncheckedHabits[0]?.name}" is still pending today. Complete it to maintain your streak!
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/habits"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0"
              >
                <span>Check in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* High Priority Task Alert */}
          {pendingHighTasks.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-heading">
                    High Priority Task Pending
                  </h4>
                  <p className="text-xs text-slate-300">
                    "{pendingHighTasks[0]?.title}" is marked as high priority.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/tasks"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0"
              >
                <span>View Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Status info */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">
                  System Synchronized
                </h4>
                <p className="text-xs text-slate-400">
                  Your LifeOS daily score and data streams are active and up to date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
