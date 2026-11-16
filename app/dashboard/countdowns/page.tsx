"use client";

import { useState, useEffect } from "react";
import { 
  Hourglass, 
  Plus, 
  Trash2, 
  Calendar, 
  Cake,
  GraduationCap,
  Plane,
  Heart,
  PartyPopper,
  X
} from "lucide-react";

export default function CountdownsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("Birthday");
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/countdowns");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
        setNextEvent(data.nextEvent);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const timer = setInterval(() => loadEvents(), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/countdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetDate,
          category,
        }),
      });
      if (res.ok) {
        setTitle("");
        setTargetDate("");
        setShowAddModal(false);
        loadEvents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/countdowns?id=${id}`, { method: "DELETE" });
      loadEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "birthday":
        return <Cake className="w-3.5 h-3.5 text-rose-500" />;
      case "exam":
        return <GraduationCap className="w-3.5 h-3.5 text-blue-500" />;
      case "trip":
        return <Plane className="w-3.5 h-3.5 text-amber-500" />;
      case "anniversary":
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <PartyPopper className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const upcomingEvents = events.filter((e) => !e.isPast);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Hourglass className="w-5 h-5" />
            </span>
            <span>Countdowns</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Special days, milestones & events</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Event</span>
        </button>
      </div>

      {/* Hero: Nearest Event */}
      {nextEvent && (
        <div className="designer-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              NEXT UP
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              {nextEvent.title}
            </h2>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(nextEvent.targetDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-center min-w-[90px] shadow-xs">
              <div className="text-3xl font-extrabold font-heading">{Math.max(0, nextEvent.daysLeft)}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Days Left</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Events */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          All Events ({upcomingEvents.length})
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="designer-card-static p-12 text-center text-xs text-slate-400">
            No events scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {upcomingEvents.map((e) => {
              const isUrgent = e.daysLeft <= 3;
              return (
                <div
                  key={e.id}
                  className="designer-card p-4 space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <div className="p-1 rounded-md bg-slate-100">
                        {getCategoryIcon(e.category)}
                      </div>
                      <span>{e.category}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading truncate">{e.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(e.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isUrgent
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {e.countdownText}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{e.daysLeft}d left</span>
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
              New Special Day
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birthday, Exam, Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Target Date *</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="Birthday">Birthday</option>
                  <option value="Exam">Exam / Academic</option>
                  <option value="Trip">Trip / Travel</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Holiday">Holiday / Event</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                {submitting ? "Saving..." : "Start Countdown"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
