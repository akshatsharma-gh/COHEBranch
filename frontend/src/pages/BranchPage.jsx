import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import BranchIcon from "@/components/BranchIcon";
import PersonCard from "@/components/PersonCard";
import PageTransition from "@/components/PageTransition";
import { fetchBranch } from "@/lib/api";
import { BRANCH } from "@/constants/testIds/che";

const ROLE_ACCENT = {
  "Assistant Director": {
    ring: "ring-amber-200",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  Superintendent: {
    ring: "ring-slate-200",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Assistant: {
    ring: "ring-slate-200",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Clerk: {
    ring: "ring-slate-100",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  DEO: {
    ring: "ring-slate-100",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const chainVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const nodeVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const lineVariants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function BranchPage() {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const b = await fetchBranch(id);
        if (alive) setBranch(b);
      } catch (e) {
        if (alive) setError(e?.response?.data?.error || "Failed to load branch.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <PageTransition>
      <AppShell>
        <div className="mb-8">
          <button
            data-testid={BRANCH.backButton}
            onClick={() => navigate("/dashboard")}
            className="che-btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to branches
          </button>
        </div>

        {loading && <BranchSkeleton />}

        {!loading && error && (
          <div className="che-card p-10 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-display text-2xl text-slate-900 mt-3">{error}</p>
            <Link to="/dashboard" className="che-btn-primary mt-6 inline-flex">
              Return to dashboard
            </Link>
          </div>
        )}

        {!loading && branch && (
          <>
            {/* Header */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 md:grid-cols-[1fr_auto] items-start mb-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-amber-500 shadow-lg shadow-slate-900/20">
                    <BranchIcon name={branch.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                    {branch.code}
                  </span>
                </div>
                <h1
                  data-testid={BRANCH.title}
                  className="font-display text-4xl sm:text-5xl leading-[1.05] che-gradient-text"
                >
                  {branch.name}
                </h1>
                <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
                  {branch.description}
                </p>
              </div>

              <div className="rounded-xl che-glass px-5 py-4 min-w-[200px]">
                <div className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Reporting chain
                </div>
                <div className="font-display text-3xl text-slate-900 mt-1">
                  {branch.hierarchy.length} levels
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Top-down organisational structure
                </div>
              </div>
            </motion.section>

            {/* Hierarchy */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-slate-200" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                  Officer Hierarchy · Hover or tap a card for details
                </p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <motion.div
                variants={chainVariants}
                initial="hidden"
                animate="show"
                className="mx-auto max-w-2xl"
              >
                {branch.hierarchy.map((node, i) => {
                  const accent = ROLE_ACCENT[node.role] || ROLE_ACCENT.Assistant;
                  const testId = {
                    name: BRANCH.orgNodeName(
                      `${node.role.toLowerCase().replace(/\s+/g, "-")}-${i}`
                    ),
                    role: BRANCH.orgNodeRole(
                      `${node.role.toLowerCase().replace(/\s+/g, "-")}-${i}`
                    ),
                  };
                  const isLast = i === branch.hierarchy.length - 1;

                  return (
                    <motion.div
                      key={`${node.level}-${node.name}`}
                      variants={nodeVariants}
                      className="relative flex items-stretch"
                    >
                      <div className="flex flex-col items-center pr-4 pt-4">
                        <span className="che-level-dot" aria-hidden />
                        {!isLast && (
                          <motion.span
                            variants={lineVariants}
                            className="che-connector"
                            aria-hidden
                          />
                        )}
                      </div>

                      <PersonCard node={node} accent={accent} testId={testId} isLast={isLast} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </section>
          </>
        )}
      </AppShell>
    </PageTransition>
  );
}

function BranchSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-2/3 bg-slate-200 rounded" />
      <div className="h-4 w-1/2 bg-slate-100 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="che-card h-20" />
        ))}
      </div>
    </div>
  );
}
