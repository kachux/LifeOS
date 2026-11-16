"use client";

import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 font-sans text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
        <Zap className="w-8 h-8 fill-amber-500 text-amber-500" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          100% Free Forever
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We have completely removed all subscriptions and payment gates. LifeOS is entirely free and open for you.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>All 5 Core Modules Unlocked:</span>
        </div>

        <ul className="space-y-2 text-xs text-slate-600 font-medium">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span><strong>Money Balance System:</strong> Complete transaction ledger in ₹ INR.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span><strong>Special Days & Countdowns:</strong> Live days counter to major events.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span><strong>Tasks to Do & Deadlines:</strong> 1-click completion and due date badges.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span><strong>Daily Habits Tik List:</strong> Daily check list and compounding streak counts.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span><strong>AI Assistant (Google Gemini):</strong> Unlimited questions, doubts, and brainstorming.</span>
          </li>
        </ul>
      </div>

      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-red-500/20 transition-all"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
