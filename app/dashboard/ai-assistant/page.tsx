"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  HelpCircle, 
  Lightbulb, 
  Compass,
  ArrowUp
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || data.error || "Unable to get response. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Network connection error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterPrompts = [
    {
      icon: HelpCircle,
      title: "Clear a Doubt",
      prompt: "How can I balance urgent deadlines with my daily habits?",
      color: "text-rose-500",
      bg: "bg-rose-50 border-rose-100",
    },
    {
      icon: Lightbulb,
      title: "Brainstorm Ideas",
      prompt: "Suggest 3 practical ways to increase my personal savings this month.",
      color: "text-amber-500",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      icon: Compass,
      title: "Find a Way Forward",
      prompt: "Give me a step-by-step action plan to prepare for an upcoming exam or goal.",
      color: "text-red-500",
      bg: "bg-red-50 border-red-100",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-heading">AI Assistant</h1>
            <p className="text-[11px] text-slate-400">Doubts, Ideas & Ways Forward</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-xs">
              <Sparkles className="w-6 h-6 fill-amber-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-heading">What would you like to explore?</h2>
              <p className="text-xs text-slate-400 max-w-sm">Ask any question, clear any confusion, or ask for practical roadmaps.</p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl text-left">
              {starterPrompts.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.prompt)}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all duration-200 text-left space-y-1.5 group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <div className={`p-1 rounded-lg ${s.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                      </div>
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-700">
                      {s.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 text-xs ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                  </div>
                )}

                <div
                  className={`relative max-w-[82%] rounded-2xl px-4 py-3 leading-relaxed transition-all ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs whitespace-pre-line"
                  }`}
                >
                  <div className="text-[13px]">{m.content}</div>

                  <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-slate-800 transition-colors flex items-center gap-1 font-semibold"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-2.5 text-xs justify-start animate-fade-in">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-400 text-xs flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.3s]" />
              <span className="ml-1 text-[11px] text-slate-500 font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="shrink-0 pt-2">
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white rounded-xl flex items-center justify-center shadow-xs transition-all shrink-0 active:scale-90"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
