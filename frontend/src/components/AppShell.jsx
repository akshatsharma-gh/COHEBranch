import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, LogOut, UserRound } from "lucide-react";
import { authStore } from "@/lib/api";
import { DASHBOARD } from "@/constants/testIds/che";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const user = authStore.user;

  const logout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[color:var(--che-page)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: -4, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors"
            >
              <Landmark className="w-4 h-4 text-amber-500" strokeWidth={2} />
            </motion.div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                Govt. of Haryana
              </p>
              <p className="font-display text-[15px] text-slate-900">
                Centre of Higher Education
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                <UserRound className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-sm text-slate-700 font-medium">
                {user?.username || "admin"}
              </span>
              <span className="text-[10px] uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
                {user?.role || "admin"}
              </span>
            </div>
            <button
              data-testid={DASHBOARD.logoutButton}
              onClick={logout}
              className="che-btn-ghost"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Centre of Higher Education, Haryana</span>
          <span className="tracking-wider uppercase">Internal Portal · v2.0</span>
        </div>
      </footer>
    </div>
  );
}
