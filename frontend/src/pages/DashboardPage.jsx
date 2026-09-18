import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Search, ChevronRight, Users, Building2, Filter, Plus, Pencil, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import BranchIcon from "@/components/BranchIcon";
import PageTransition from "@/components/PageTransition";
import IntroSequence from "@/components/IntroSequence";
import BranchFormDialog from "@/components/admin/BranchFormDialog";
import DeleteConfirm from "@/components/DeleteConfirm";
import { fetchBranches, createBranch, updateBranch, deleteBranch, authStore } from "@/lib/api";
import { DASHBOARD } from "@/constants/testIds/che";

const INTRO_SEEN_KEY = "che_intro_seen";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function CountUp({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value || 0, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

export default function DashboardPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const isAdmin = Boolean(authStore.token);
  const cardRefs = useRef({});
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await fetchBranches();
      setBranches(data.branches);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  })();

  const handleCreate = () => {
    setEditingBranch(null);
    setFormOpen(true);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (editingBranch) {
      await updateBranch(editingBranch.id, payload);
      await loadBranches();
    } else {
      const created = await createBranch(payload);
      // Jump straight into the new branch so the admin can add officers.
      navigate(`/branch/${created.id}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBranch(deleteTarget.id);
    setDeleteTarget(null);
    await loadBranches();
  };

  return (
    <PageTransition>
      <AppShell>
        {/* Page header */}
        <section className="grid gap-6 md:grid-cols-[1.4fr_1fr] items-end mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700 font-semibold mb-3">
              Directorate · Branch Directory
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] che-gradient-text">
              All Branches
            </h1>
            <p className="mt-3 text-slate-600 max-w-xl leading-relaxed">
              Browse the {branches.length || 33} operational branches of the Centre.
              Select any branch to view its officer hierarchy — from Assistant Director down to DEO.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                icon={<Building2 className="w-4 h-4" />}
                label="Branches"
                value={branches.length}
              />
              <StatTile
                icon={<Users className="w-4 h-4" />}
                label="Officers indexed"
                value={branches.reduce((s, b) => s + b.headcount, 0)}
              />
            </div>
          </motion.div>
        </section>

        {/* Search + admin actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              data-testid={DASHBOARD.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search branch by name or code…"
              className="che-input pl-9"
            />
          </div>
          {isAdmin && (
            <button
              data-testid={DASHBOARD.addBranchButton}
              onClick={handleCreate}
              className="che-btn-primary !py-2.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add branch
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span data-testid={DASHBOARD.branchCount}>
              Showing <b className="text-slate-900">{filtered.length}</b> of {branches.length}
            </span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-testid={DASHBOARD.emptyState}
            className="che-card p-10 text-center"
          >
            <p className="font-display text-2xl text-slate-900">No branches match "{query}".</p>
            <p className="text-slate-500 mt-2 text-sm">Try a different keyword.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            data-testid={DASHBOARD.branchesGrid}
            className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((b) => (
              <BranchCard
                key={b.id}
                branch={b}
                isAdmin={isAdmin}
                onEdit={() => handleEdit(b)}
                onDelete={() => setDeleteTarget(b)}
                innerRef={(el) => {
                  cardRefs.current[b.id] = el;
                }}
              />
            ))}
          </motion.div>
        )}
      </AppShell>

      {showIntro && !loading && branches.length > 0 && (
        <IntroSequence
          branches={branches}
          getCardRect={(id) => cardRefs.current[id]?.getBoundingClientRect() || null}
          onComplete={() => {
            try {
              sessionStorage.setItem(INTRO_SEEN_KEY, "1");
            } catch {
              /* sessionStorage unavailable — intro will just replay next time */
            }
            setShowIntro(false);
          }}
        />
      )}

      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editingBranch}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This removes the branch and its entire officer hierarchy permanently. This cannot be undone."
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}

function BranchCard({ branch, isAdmin, onEdit, onDelete, innerRef }) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -6 }} className="h-full">
      <Link
        ref={innerRef}
        to={`/branch/${branch.id}`}
        data-testid={DASHBOARD.branchCard(branch.id)}
        className="che-card block p-5 h-full group relative overflow-hidden"

      >
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden
        />

        {isAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            <button
              data-testid={DASHBOARD.editBranchButton(branch.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="w-7 h-7 rounded-md bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm"
              aria-label={`Edit ${branch.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              data-testid={DASHBOARD.deleteBranchButton(branch.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="w-7 h-7 rounded-md bg-white/90 border border-slate-200 flex items-center justify-center text-red-500 hover:text-red-600 hover:border-red-300 shadow-sm"
              aria-label={`Delete ${branch.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-amber-500 group-hover:bg-slate-800 group-hover:scale-105 transition-all duration-300">
            <BranchIcon name={branch.icon} className="w-5 h-5" />
          </div>
          {!isAdmin && (
            <span className="text-[10px] font-semibold tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
              {branch.code}
            </span>
          )}
        </div>

        <h3 className="mt-5 font-display text-xl text-slate-900 leading-tight">
          {branch.name}
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
          {branch.description}
        </p>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {branch.headcount} officers
          </span>
          <span className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1 group-hover:text-amber-700 transition-colors">
            View hierarchy
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-xl che-glass px-4 py-3">
      <div className="flex items-center gap-2 text-slate-500 text-[11px] uppercase tracking-widest font-semibold">
        <span className="text-amber-600">{icon}</span>
        {label}
      </div>
      <div className="font-display text-2xl text-slate-900 mt-1">
        <CountUp value={value} />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="che-card p-5 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-slate-200" />
          <div className="h-5 w-3/4 bg-slate-200 mt-5 rounded" />
          <div className="h-3 w-full bg-slate-100 mt-3 rounded" />
          <div className="h-3 w-2/3 bg-slate-100 mt-2 rounded" />
          <div className="h-8 border-t border-slate-100 mt-5" />
        </div>
      ))}
    </div>
  );
}