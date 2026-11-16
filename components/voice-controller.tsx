"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, CheckCircle2 } from "lucide-react";

interface VoiceControllerProps {
  onCommandExecuted?: (message: string) => void;
}

export default function VoiceController({ onCommandExecuted }: VoiceControllerProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      if (event.results[current].isFinal) {
        processVoiceCommand(text);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = async (cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    let actionDone = false;

    // Navigation
    if (lower.includes("go to") || lower.includes("open") || lower.includes("show")) {
      if (lower.includes("task")) {
        router.push("/dashboard/tasks");
        setFeedback("Opening Tasks");
        speakText("Opening tasks");
        actionDone = true;
      } else if (lower.includes("finance") || lower.includes("money")) {
        router.push("/dashboard/finance");
        setFeedback("Opening Finances");
        speakText("Opening finances");
        actionDone = true;
      } else if (lower.includes("habit")) {
        router.push("/dashboard/habits");
        setFeedback("Opening Habits");
        speakText("Opening habits");
        actionDone = true;
      } else if (lower.includes("study") || lower.includes("focus")) {
        router.push("/dashboard/study");
        setFeedback("Opening Study");
        speakText("Opening study timer");
        actionDone = true;
      } else if (lower.includes("plan") || lower.includes("improvement")) {
        router.push("/dashboard/improvement-plan");
        setFeedback("Opening Improvement Plan");
        speakText("Opening improvement plan");
        actionDone = true;
      }
    }

    // Add Task
    if (!actionDone && (lower.startsWith("add task") || lower.startsWith("new task"))) {
      const taskTitle = lower.replace(/^(add task|new task)/, "").trim();
      if (taskTitle) {
        try {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: taskTitle }),
          });
          setFeedback(`Added task: ${taskTitle}`);
          speakText(`Added task`);
          if (onCommandExecuted) onCommandExecuted(taskTitle);
          actionDone = true;
        } catch (e) {}
      }
    }

    // Log Expense
    if (!actionDone && lower.includes("expense")) {
      const match = lower.match(/\d+(\.\d+)?/);
      const amount = match ? parseFloat(match[0]) : 10;
      try {
        await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Voice Expense",
            amount,
            type: "EXPENSE",
          }),
        });
        setFeedback(`Logged $${amount} expense`);
        speakText(`Logged expense`);
        if (onCommandExecuted) onCommandExecuted(`Logged $${amount}`);
        actionDone = true;
      } catch (e) {}
    }

    if (!actionDone) {
      setFeedback(`Noted: "${cmd}"`);
      speakText("Command received");
    }

    setTimeout(() => {
      setFeedback(null);
      setTranscript("");
    }, 3500);
  };

  const toggleListening = () => {
    if (!supported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setFeedback(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={toggleListening}
        title="Voice Control"
        className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
          isListening
            ? "bg-rose-600 text-white animate-pulse"
            : "bg-slate-800 text-slate-300 hover:text-white"
        }`}
      >
        <Mic className="w-4 h-4" />
        <span className="hidden md:inline">{isListening ? "Listening..." : "Voice"}</span>
      </button>

      {(isListening || transcript || feedback) && (
        <div className="absolute right-0 top-12 w-72 p-3 rounded-xl bg-[#111827] border border-slate-800 shadow-xl z-50 text-xs space-y-1.5">
          {transcript && (
            <p className="text-slate-300 italic">"{transcript}"</p>
          )}
          {feedback && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{feedback}</span>
            </div>
          )}
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            Try: "Add task Buy groceries" or "Open study"
          </div>
        </div>
      )}
    </div>
  );
}
