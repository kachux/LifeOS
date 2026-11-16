"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Hourglass, 
  CheckSquare, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Flame, 
  AlertCircle,
  Calendar,
  ArrowUp
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [money, setMoney] = useState<any>(null);
  const [countdowns, setCountdowns] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [habitSummary, setHabitSummary] = useState<any>(null);

  // AI quick ask
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = async () => {
    try {
      const [uRes, mRes, cRes, tRes, hRes] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch("/api/finance").then((r) => r.json()),
        fetch("/api/countdowns").then((r) => r.json()),
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/habits").then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (mRes.summary) setMoney(mRes);
      if (cRes.events) {
        setCountdowns(cRes.events);
        setNextEvent(cRes.nextEvent);
      }
      if (tRes.tasks) setTasks(tRes.tasks);
      if (hRes.habits) {
        setHabits(hRes.habits);
        setHabitSummary(hRes);
      }
    } catch (e) {
      console.error("Dashboard load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (task: any) => {
    try {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE";
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiReply(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiReply(data.reply);
      } else if (data.error) {
        setAiReply(`⚠️ ${data.error}`);
      }
    } catch (e) {
      setAiReply("⚠️ Unable to reach AI. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const currentBalance = money?.summary?.currentBalance ?? 0;
  const pendingTasks = tasks.filter((t) => t.status !== "DONE");
  const overdueTasks = pendingTasks.filter((t) => t.isOverdue);

  const todayDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans animate-fade-in">
      {/* 1. Executive Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
            Hello, <span className="text-rose-600">{user?.username || "Friend"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{todayDateString}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/ai-assistant"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Chat</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money */}
        <Link
          href="/dashboard/money"
          className="designer-card p-5 block group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium">
            <span className="text-emerald-600 font-bold">+₹{money?.summary?.thisMonthIncome || 0}</span>
            <span>•</span>
            <span className="text-rose-600 font-bold">-₹{money?.summary?.thisMonthExpense || 0}</span>
          </div>
        </Link>

        {/* Countdowns */}
        <Link
          href="/dashboard/countdowns"
          className="designer-card p-5 block group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Event</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-heading text-slate-900 truncate">
            {nextEvent ? nextEvent.title : "No events set"}
          </div>
          <div className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{nextEvent ? nextEvent.countdownText : "Add a countdown"}</span>
          </div>
        </Link>

        {/* Tasks */}
        <Link
          href="/dashboard/tasks"
          className="designer-card p-5 block group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tasks Due</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            {pendingTasks.length}
          </div>
          <div className="text-xs mt-2 font-medium">
            {overdueTasks.length > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {overdueTasks.length} Overdue
              </span>
            ) : (
              <span className="text-slate-400">On schedule</span>
            )}
          </div>
        </Link>

        {/* Habits */}
        <Link
          href="/dashboard/habits"
          className="designer-card p-5 block group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Habits Today</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            {habitSummary?.completedTodayCount || 0} / {habitSummary?.totalHabitsCount || 0}
          </div>
          <div className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{habitSummary?.todayRate || 0}% completed</span>
          </div>
        </Link>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Tasks & Deadlines */}
        <div className="designer-card-static p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900 font-heading">Tasks</h2>
            </div>
            <Link
              href="/dashboard/tasks"
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View All →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No tasks pending. Tap New Item above.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((t) => {
                const isDone = t.status === "DONE";
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(t)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isDone
                            ? "bg-rose-600 border-rose-600 text-white"
                            : "border-slate-300 hover:border-rose-500 bg-white"
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span className={`truncate font-medium ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {t.title}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      isDone
                        ? "bg-slate-200/80 text-slate-400"
                        : t.isOverdue
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : t.isToday
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}>
                      {t.countdownText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Daily Habits Checklist */}
        <div className="designer-card-static p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 font-heading">Habits</h2>
            </div>
            <Link
              href="/dashboard/habits"
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View All →
            </Link>
          </div>

          {habits.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No habits yet. Tap New Item to start tracking.
            </div>
          ) : (
            <div className="space-y-2">
              {habits.slice(0, 5).map((h) => {
                const ticked = h.isCompletedToday;
                return (
                  <div
                    key={h.id}
                    onClick={() => handleToggleHabit(h.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                      ticked
                        ? "bg-amber-50/50 border-amber-200/80 text-amber-950 font-bold"
                        : "bg-slate-50/70 hover:bg-slate-50 border-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          ticked
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {ticked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold">{h.name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-mono font-bold">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{h.streak || 0}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Instant AI Prompt */}
      <div className="designer-card-static p-4 space-y-3">
        <form onSubmit={handleAskAi} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI: doubts, ideas, methods, or action plans..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-9 h-9 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-xs"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>

        {aiReply && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 whitespace-pre-line leading-relaxed animate-fade-in">
            {aiReply}
          </div>
        )}
      </div>
    </div>
  );
}
