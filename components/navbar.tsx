"use client";

import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import QuickCaptureModal from "./quick-capture-modal";

interface NavbarProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export default function Navbar({ onToggleMobileMenu, title = "Dashboard" }: NavbarProps) {
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-5 sm:px-8 flex items-center justify-between font-sans">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
            {title}
          </h1>
        </div>

        {/* Right: Quick Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickCapture(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Item</span>
          </button>
        </div>
      </header>

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
