"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock
} from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Work");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          startDate: new Date(startDate),
          endDate: new Date(startDate),
        }),
      });
      setTitle("");
      setShowAddModal(false);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <span>Calendar & Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize appointments and time-block your day.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-heading">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 rounded-xl bg-slate-950/20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = dateObj.toISOString().split("T")[0];
              const dayEvents = events.filter(
                (e) => new Date(e.startDate).toISOString().split("T")[0] === dateStr
              );
              const isToday = new Date().toISOString().split("T")[0] === dateStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setStartDate(dateStr);
                    setShowAddModal(true);
                  }}
                  className={`h-16 p-1 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all hover:border-blue-500/50 ${
                    isToday ? "bg-blue-950/20 border-blue-500/40" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${isToday ? "text-blue-400" : "text-slate-400"}`}>
                    {dayNum}
                  </span>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="truncate text-[9px] px-1 py-0.5 rounded bg-blue-600/20 text-blue-300"
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Upcoming Agenda</span>
          </h3>

          {events.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No events scheduled yet.</p>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-white">{ev.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {new Date(ev.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading mb-3">Add Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Review"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
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
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
