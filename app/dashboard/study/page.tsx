"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen
} from "lucide-react";

export default function StudyPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState("0.0");
  const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("Focus Sprint");

  const modeTimes = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const fetchStudyData = async () => {
    try {
      const res = await fetch("/api/study");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
      if (data.totalHours) setTotalHours(data.totalHours);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      logCompletedSession();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const switchMode = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setTimeLeft(modeTimes[newMode]);
    setIsRunning(false);
  };

  const logCompletedSession = async () => {
    const mins = Math.round(modeTimes[mode] / 60);
    try {
      await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject || "Focus Session",
          durationMinutes: mins,
          notes: `Completed ${mode} sprint`,
        }),
      });
      fetchStudyData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-amber-400" />
          <span>Study & Focus Timer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          25-minute Pomodoro intervals to stay focused on one thing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timer Card */}
        <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-6">
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs max-w-xs mx-auto">
            <button
              onClick={() => switchMode("pomodoro")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                mode === "pomodoro" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode("shortBreak")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                mode === "shortBreak" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Short (5m)
            </button>
            <button
              onClick={() => switchMode("longBreak")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                mode === "longBreak" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Long (15m)
            </button>
          </div>

          <div className="py-4">
            <div className="text-6xl font-bold font-mono text-white tracking-wider font-heading">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-amber-400 font-medium mt-1">
              {isRunning ? "Focus sprint in progress" : "Ready"}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? "Pause" : "Start"}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(modeTimes[mode]);
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 text-left">
            <label className="block text-[11px] text-slate-400 mb-1">Subject / Topic</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Reading, Coding, Writing"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Sessions History */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Total Focus Time</div>
              <div className="text-2xl font-bold text-white font-heading font-mono">{totalHours} hrs</div>
            </div>
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Completed Sprints ({sessions.length})
          </h3>

          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No study sessions logged yet. Complete your first 25-minute sprint!
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-white">{s.subject}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(s.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold">
                    +{s.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
