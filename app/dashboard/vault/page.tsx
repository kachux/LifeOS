"use client";

import { useState, useEffect } from "react";
import { 
  FolderLock, 
  FileText, 
  Plus, 
  Trash2, 
  Lock, 
  Search
} from "lucide-react";

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [isVault, setIsVault] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (!activeDoc && data.documents.length > 0) {
          setActiveDoc(data.documents[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          isVault,
        }),
      });
      const data = await res.json();
      setTitle("");
      setContent("");
      setShowAddModal(false);
      fetchDocuments();
      if (data.document) setActiveDoc(data.document);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/vault?id=${id}`, { method: "DELETE" });
      fetchDocuments();
      if (activeDoc?.id === id) setActiveDoc(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-teal-400" />
            <span>Document Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Store personal notes, documents, and private thoughts safely.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto space-y-3">
          <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-heading">Vault is empty</h3>
          <p className="text-xs text-slate-400">
            Write down your core principles, goals, or notes to keep them organized.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
          {/* Notes List */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3 flex flex-col">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    activeDoc?.id === doc.id
                      ? "bg-teal-950/20 border-teal-500/40 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{doc.title}</div>
                    <div className="text-[10px] text-slate-500">{doc.category}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="text-slate-600 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reader */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#111827] border border-slate-800">
            {activeDoc ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white font-heading">{activeDoc.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {activeDoc.category} • Updated {new Date(activeDoc.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeDoc.content}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Select a note to read
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading mb-3">Add Note</h3>
            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
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
                  placeholder="Personal, Work, Ideas..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
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
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
