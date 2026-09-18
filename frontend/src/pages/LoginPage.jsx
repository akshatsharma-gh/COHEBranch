import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { login, authStore } from "@/lib/api";
import { AUTH } from "@/constants/testIds/che";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageTransition from "@/components/PageTransition";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (authStore.token) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
        <AnimatedBackground variant="rich" />

        <div className="che-vline left-[46%] hidden md:block" aria-hidden />

        <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">
          {/* Left: form */}
          <div className="flex items-center justify-start px-6 sm:px-10 lg:px-20 py-16">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="w-full max-w-md"
            >
              <motion.div variants={item} className="flex items-center gap-3 mb-10">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Landmark className="w-5 h-5 text-amber-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                    Government of Haryana
                  </p>
                  <p className="text-sm text-slate-700 font-medium">CHE Admin Portal</p>
                </div>
              </motion.div>

              <motion.h1
                variants={item}
                className="font-display text-4xl sm:text-5xl leading-[1.05] che-gradient-text"
              >
                Centre of Higher
                <br />
                Education, Haryana
              </motion.h1>
              <motion.p variants={item} className="mt-4 text-slate-600 max-w-md leading-relaxed">
                Sign in to access branch directories, hierarchies and departmental
                records maintained by the Centre.
              </motion.p>

              <motion.form
                variants={item}
                onSubmit={submit}
                className="mt-10 space-y-4 che-glass rounded-2xl p-6 shadow-xl shadow-slate-900/5"
              >
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Username
                  </span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      data-testid={AUTH.usernameInput}
                      className="che-input pl-9"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Password
                  </span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      data-testid={AUTH.passwordInput}
                      type="password"
                      className="che-input pl-9"
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </label>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid={AUTH.errorAlert}
                    className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  data-testid={AUTH.submitButton}
                  type="submit"
                  disabled={loading}
                  className="che-btn-primary w-full mt-2"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-xs text-slate-500 pt-2">
                  Demo credentials — username: <span className="font-semibold text-slate-700">admin</span>{" "}
                  · password: <span className="font-semibold text-slate-700">1234</span>
                </p>
              </motion.form>
            </motion.div>
          </div>

          {/* Right: monumental quote panel */}
          <div className="hidden md:flex relative items-end p-14">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full che-glass px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] uppercase tracking-widest text-slate-700 font-semibold">
                  Est. 2015 · Panchkula
                </span>
              </div>
              <p className="font-display text-3xl leading-tight text-slate-900">
                "A single hub for every branch, every officer, every record."
              </p>
              <p className="mt-4 text-sm text-slate-700">Internal Directorate Portal</p>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
