import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck, LogIn } from "lucide-react";
import { authStore } from "@/lib/api";
import { DASHBOARD } from "@/constants/testIds/che";
import dheLogo from "@/assets/dhe-crest.png";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const user = authStore.user;
  const isAdmin = Boolean(authStore.token);

  const logout = () => {
    authStore.clear();
    navigate("/dashboard", { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[color:var(--che-page)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group" id="che-header-logo">
            <motion.img
              src={dheLogo}
              alt="Government of Haryana"
              whileHover={{ rotate: -4, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-10 h-10 object-contain shrink-0"
            />
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
            {isAdmin ? (
              <>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    {user?.username || "admin"}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest bg-white text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
                    Admin mode
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
              </>
            ) : (
              <button
                data-testid={DASHBOARD.loginButton}
                onClick={() => navigate("/login")}
                className="che-btn-primary !py-2 !px-4"
                aria-label="Admin login"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin login</span>
              </button>
            )}
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