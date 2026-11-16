"use client";

import { useState, useEffect } from "react";
import { 
  Milestone, 
  Plus, 
  Star
} from "lucide-react";

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Milestone");

  const fetchTimeline = async () => {
    try {
      const res = await fetch("/api/timeline");
      const data = await res.json();
      if (data.timeline) setTimeline(data.timeline);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          date: new Date(),
        }),
      });
      setTitle("");
      setDescription("");
      setShowAddModal(false);
      fetchTimeline();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Milestone className="w-6 h-6 text-pink-400" />
            <span>Personal Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record your personal achievements and life milestones over time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {timeline.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-3">
          <Milestone className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-heading">No milestones recorded yet</h3>
          <p className="text-xs text-slate-400">
            Log your achievements, milestones, and personal moments.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Milestone</span>
          </button>
        </div>
      ) : (
        <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
          {timeline.map((item) => (
            <div key={item.id} className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#0b0f19]" />
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-pink-400 font-semibold">{item.category}</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-heading">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading mb-3">Add Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Launched new project"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Milestone">Milestone</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Habit Goal">Habit Goal</option>
                  <option value="Life Moment">Life Moment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
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
                  className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
