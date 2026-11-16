"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  Hourglass, 
  CheckSquare, 
  CheckCircle2, 
  Sparkles, 
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  user?: {
    username: string;
  };
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  user,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Money", href: "/dashboard/money", icon: Wallet },
    { label: "Countdowns", href: "/dashboard/countdowns", icon: Hourglass },
    { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { label: "Habits", href: "/dashboard/habits", icon: CheckCircle2 },
    { label: "AI Chat", href: "/dashboard/ai-assistant", icon: Sparkles },
  ];

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 font-sans ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xs font-black text-sm tracking-tight transition-transform group-hover:scale-105 duration-200">
              L
            </div>
            <div className="font-bold text-base text-slate-900 tracking-tight font-heading">
              Life<span className="text-rose-600">OS</span>
            </div>
          </Link>

          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard/money" && pathname === "/dashboard/finance");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-rose-400 scale-110" : "text-slate-400 group-hover:text-slate-700"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center uppercase shrink-0">
              {currentUser?.username?.[0] || "U"}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.username || "Account"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
