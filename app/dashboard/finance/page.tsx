"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2, 
  DollarSign
} from "lucide-react";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [category, setCategory] = useState("Food");

  const fetchFinanceData = async () => {
    try {
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
      if (data.budgets) setBudgets(data.budgets);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          amount: parseFloat(amount),
          type,
          category,
        }),
      });
      setTitle("");
      setAmount("");
      setShowAddModal(false);
      fetchFinanceData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
      fetchFinanceData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Personal Finances</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log your income and expenses to keep track of your savings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
            <span>Total Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading font-mono">
            ${summary.totalIncome.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
            <span>Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading font-mono">
            ${summary.totalExpense.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
            <span>Net Balance</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading font-mono">
            ${summary.netSavings.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <p>No transactions logged yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
            >
              + Log First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-semibold">
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-medium text-white">{tx.title}</td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.category}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono font-semibold text-right ${
                        tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading mb-3">Record Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    type === "EXPENSE" ? "bg-rose-600 text-white" : "text-slate-400"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    type === "INCOME" ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lunch or Freelance"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Food, Rent..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
