"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  RefreshCw,
  Plus
} from "lucide-react";
import UpgradeModal from "@/components/upgrade-modal";

export default function ImprovementPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [actionSteps, setActionSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [adoptedSteps, setAdoptedSteps] = useState<number[]>([]);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/ai/analyze");
      const data = await res.json();
      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans);
        setCurrentPlan(data.plans[0]);
        try {
          setActionSteps(JSON.parse(data.plans[0].actionSteps));
        } catch (e) {
          setActionSteps([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        setQuotaInfo(data);
        setUpgradeModalOpen(true);
        return;
      }

      if (data.success && data.plan) {
        setPlans([data.plan, ...plans]);
        setCurrentPlan(data.plan);
        setActionSteps(data.actionSteps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptStep = async (step: any, index: number) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: step.title,
          description: step.description,
          priority: step.impact === "High" ? "HIGH" : "MEDIUM",
          category: "AI Plan",
        }),
      });
      setAdoptedSteps([...adoptedSteps, index]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unique Feature</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <span>AI Activity Improvement Plan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI analyzes your daily habits, tasks, and focus to create a personalized routine.
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Generate New Plan</span>
            </>
          )}
        </button>
      </div>

      {initialLoading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading plans...</div>
      ) : !currentPlan ? (
        /* Empty State */
        <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-heading">No Plan Created Yet</h3>
          <p className="text-xs text-slate-400">
            Click the button to let AI review your current activities and build your 3-step action plan.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Plan</span>
          </button>
        </div>
      ) : (
        /* Active Plan */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-heading">
                {currentPlan.title}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date(currentPlan.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {currentPlan.diagnostic}
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
              <Target className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{currentPlan.focusAreas}</span>
            </div>
          </div>

          {/* Action Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-heading">
              Prescribed Action Steps ({actionSteps.length})
            </h3>

            {actionSteps.map((step, idx) => {
              const isAdopted = adoptedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-heading">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdoptStep(step, idx)}
                    disabled={isAdopted}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto shrink-0 ${
                      isAdopted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30"
                    }`}
                  >
                    {isAdopted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Added to Tasks</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        resetHours={quotaInfo?.resetHours}
        resetMinutes={quotaInfo?.resetMinutes}
        onSuccess={() => fetchPlans()}
      />
    </div>
  );
}
