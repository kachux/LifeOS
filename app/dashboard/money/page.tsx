"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  X 
} from "lucide-react";

export default function MoneyBalancePage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    currentBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    thisMonthIncome: 0,
    thisMonthExpense: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const loadMoneyData = async () => {
    try {
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoneyData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isNaN(parseFloat(amount))) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          type,
          category,
          date,
        }),
      });
      if (res.ok) {
        setTitle("");
        setAmount("");
        setShowAddModal(false);
        loadMoneyData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
      loadMoneyData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "ALL") return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80">
              <Wallet className="w-5 h-5" />
            </span>
            <span>Money Balance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Personal ledger & net savings</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setType("INCOME"); setShowAddModal(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Income</span>
          </button>

          <button
            onClick={() => { setType("EXPENSE"); setShowAddModal(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>- Expense</span>
          </button>
        </div>
      </div>

      {/* Summary 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Balance */}
        <div className="designer-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
          <div className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            ₹{summary.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Month Income */}
        <div className="designer-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Month Inflow</span>
          <div className="text-3xl font-extrabold text-amber-600 font-heading tracking-tight">
            +₹{summary.thisMonthIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Month Expense */}
        <div className="designer-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Month Outflow</span>
          <div className="text-3xl font-extrabold text-rose-600 font-heading tracking-tight">
            -₹{summary.thisMonthExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Transactions Feed */}
      <div className="designer-card-static p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            Transactions ({filteredTransactions.length})
          </h2>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("INCOME")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "INCOME" ? "bg-amber-500 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Inflow
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "EXPENSE" ? "bg-rose-600 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Outflow
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((t) => {
              const isInc = t.type === "INCOME";
              return (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3 group text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {t.category || "General"}
                      </span>
                      <span>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold font-mono text-[13px] ${isInc ? "text-amber-700" : "text-rose-600"}`}>
                      {isInc ? "+" : "-"}₹{Math.abs(t.amount).toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
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
              Record {type === "INCOME" ? "Income" : "Expense"}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  type === "EXPENSE"
                    ? "bg-rose-50 border-rose-400 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                - Outflow
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  type === "INCOME"
                    ? "bg-amber-50 border-amber-400 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                + Inflow
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
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
                  required
                  placeholder="e.g. Salary, Rent, Grocery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Category</label>
                  <input
                    type="text"
                    placeholder="General"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
