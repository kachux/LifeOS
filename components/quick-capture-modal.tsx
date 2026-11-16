"use client";

import { useState } from "react";
import { X, CheckSquare, CheckCircle2, Wallet, Hourglass, Plus } from "lucide-react";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickCaptureModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickCaptureModalProps) {
  const [tab, setTab] = useState<"task" | "money" | "countdown" | "habit">("task");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [moneyType, setMoneyType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && tab !== "money") return;

    setLoading(true);
    try {
      if (tab === "task") {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            dueDate: targetDate ? targetDate : null,
          }),
        });
      } else if (tab === "money") {
        await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || (moneyType === "INCOME" ? "Income" : "Expense"),
            amount: parseFloat(amount || "0"),
            type: moneyType,
            category,
          }),
        });
      } else if (tab === "countdown") {
        await fetch("/api/countdowns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString(),
            category,
          }),
        });
      } else if (tab === "habit") {
        await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: title, category }),
        });
      }

      setTitle("");
      setAmount("");
      setTargetDate("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xl space-y-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          New Entry
        </h3>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("task")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              tab === "task" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("money")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              tab === "money" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Money</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("countdown")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              tab === "countdown" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Event</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("habit")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              tab === "habit" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Habit</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "money" ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMoneyType("EXPENSE")}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    moneyType === "EXPENSE"
                      ? "bg-rose-50 border-rose-400 text-rose-700"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  - Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyType("INCOME")}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    moneyType === "INCOME"
                      ? "bg-amber-50 border-amber-400 text-amber-800"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  + Inflow
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="₹ 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries, Lunch, Bonus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                {tab === "task" ? "Task Title" : tab === "countdown" ? "Event Name" : "Habit Name"} *
              </label>
              <input
                type="text"
                required
                placeholder={
                  tab === "task" ? "e.g. Study chapter 4" : tab === "countdown" ? "e.g. Exam date" : "e.g. Drink 3L water"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          )}

          {(tab === "task" || tab === "countdown") && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Date</label>
              <input
                type="date"
                required={tab === "countdown"}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-xs"
          >
            {loading ? "Saving..." : "Add to LifeOS"}
          </button>
        </form>
      </div>
    </div>
  );
}
