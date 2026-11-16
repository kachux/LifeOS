"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle
} from "lucide-react";
import UpgradeModal from "@/components/upgrade-modal";

export default function ProductivityPage() {
  const [productivity, setProductivity] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/user/productivity").then((r) => r.json()),
        fetch("/api/ai/weekly-report").then((r) => r.json()),
      ]);
      if (pRes) setProductivity(pRes);
      if (rRes.reports) setReports(rRes.reports);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/ai/weekly-report", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        setQuotaInfo(data);
        setUpgradeModalOpen(true);
        return;
      }

      if (data.report) {
        setReports([data.report, ...reports]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const score = productivity?.productivityScore || 0;
  const bd = productivity?.breakdown || {
    taskScore: 0,
    habitScore: 0,
    studyScore: 0,
    financeScore: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Productivity Score & Weekly Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time score calculated from tasks, habits, study sprints, and budgets.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {generatingReport ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Weekly Report</span>
            </>
          )}
        </button>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
          <div className="text-xs text-slate-400">Current Productivity Index</div>
          <div className="text-5xl font-extrabold text-white font-heading my-2">
            {score} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            {score > 0
              ? "Calculated based on your actual completed actions today."
              : "Complete tasks and habits to start raising your score."}
          </p>
        </div>

        {/* Breakdown */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-white font-heading text-sm mb-2">Score Breakdown</h3>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Tasks (35% weight)</span>
              <span className="font-mono">{bd.taskScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${bd.taskScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Habits (30% weight)</span>
              <span className="font-mono">{bd.habitScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${bd.habitScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Study Focus (20% weight)</span>
              <span className="font-mono">{bd.studyScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${bd.studyScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Finances (15% weight)</span>
              <span className="font-mono">{bd.financeScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${bd.financeScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Weekly Life Reports</span>
        </h3>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 text-center text-xs text-slate-500">
            No weekly reports yet. Click "Generate Weekly Report" above to review your progress.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-indigo-400 font-heading">{report.week}</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{report.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        resetHours={quotaInfo?.resetHours}
        resetMinutes={quotaInfo?.resetMinutes}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
