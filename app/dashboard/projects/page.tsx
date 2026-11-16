"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          progress,
        }),
      });
      setTitle("");
      setDescription("");
      setShowAddModal(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const updateProgress = async (id: string, newProgress: number) => {
    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          progress: newProgress,
          status: newProgress === 100 ? "COMPLETED" : "IN_PROGRESS",
        }),
      });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-violet-400" />
            <span>Projects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize multi-step goals and initiatives.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-heading">No projects created yet</h3>
          <p className="text-xs text-slate-400">
            Start a project to group related goals and track your progress percentage.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-bold uppercase">
                  {proj.status === "COMPLETED" ? "Completed" : "In Progress"}
                </span>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="text-slate-600 hover:text-rose-400 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-heading">{proj.title}</h3>
                {proj.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-mono text-white font-semibold">{proj.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${proj.progress === 100 ? "bg-emerald-500" : "bg-violet-500"}`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Set:</span>
                <div className="flex gap-1">
                  {[25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateProgress(proj.id, val)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        proj.progress === val ? "bg-violet-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading mb-3">Add Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build Website or Learn Spanish"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Details</label>
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
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
