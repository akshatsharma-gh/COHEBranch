import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, AlertCircle, Pencil, Trash2, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import BranchIcon from "@/components/BranchIcon";
import PersonCard from "@/components/PersonCard";
import PageTransition from "@/components/PageTransition";
import BranchFormDialog from "@/components/admin/BranchFormDialog";
import PersonFormDialog from "@/components/admin/PersonFormDialog";
import DeleteConfirm from "@/components/DeleteConfirm";
import { fetchBranch, updateBranch, deleteBranch, authStore } from "@/lib/api";
import { BRANCH } from "@/constants/testIds/che";

const ROLE_ACCENT_DEFAULT = {
  ring: "ring-slate-200",
  badge: "bg-slate-100 text-slate-700 border-slate-200",
};
const ROLE_ACCENT = {
  "Assistant Director": {
    ring: "ring-amber-200",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

const chainVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const nodeVariantsLeft = {
  hidden: { opacity: 0, x: -46, rotate: -2 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const nodeVariantsRight = {
  hidden: { opacity: 0, x: 46, rotate: 2 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function BranchPage() {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isAdmin = Boolean(authStore.token);

  const [branchFormOpen, setBranchFormOpen] = useState(false);
  const [branchDeleteOpen, setBranchDeleteOpen] = useState(false);
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [editingPersonIndex, setEditingPersonIndex] = useState(null);
  const [deletePersonIndex, setDeletePersonIndex] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const b = await fetchBranch(id);
      setBranch(b);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load branch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const bareHierarchy = () => branch.hierarchy.map((p) => ({ name: p.name, role: p.role }));

  const handleBranchMetaSubmit = async (payload) => {
    const updated = await updateBranch(branch.id, payload);
    setBranch(updated);
  };

  const handleBranchDelete = async () => {
    await deleteBranch(branch.id);
    navigate("/dashboard");
  };

  const handleAddPerson = async (form) => {
    const next = [...bareHierarchy(), { name: form.name, role: form.role }];
    const updated = await updateBranch(branch.id, { hierarchy: next });
    setBranch(updated);
  };

  const handleEditPerson = async (form) => {
    const next = bareHierarchy();
    next[editingPersonIndex] = { name: form.name, role: form.role };
    const updated = await updateBranch(branch.id, { hierarchy: next });
    setBranch(updated);
  };

  const handleDeletePerson = async () => {
    const next = bareHierarchy().filter((_, i) => i !== deletePersonIndex);
    const updated = await updateBranch(branch.id, { hierarchy: next });
    setBranch(updated);
    setDeletePersonIndex(null);
  };

  return (
    <PageTransition>
      <AppShell>
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <button
            data-testid={BRANCH.backButton}
            onClick={() => navigate("/dashboard")}
            className="che-btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to branches
          </button>

          {isAdmin && branch && (
            <div className="flex items-center gap-2">
              <button
                data-testid={BRANCH.editBranchButton}
                onClick={() => setBranchFormOpen(true)}
                className="che-btn-ghost"
              >
                <Pencil className="w-4 h-4" />
                Edit branch
              </button>
              <button
                data-testid={BRANCH.deleteBranchButton}
                onClick={() => setBranchDeleteOpen(true)}
                className="che-btn-ghost !text-red-600 hover:!bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete branch
              </button>
            </div>
          )}
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
            <section className="relative">
              <div className="che-hierarchy-bg" />
              <div className="flex items-center gap-3 mb-8">
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
                className="che-flow-wrap mx-auto max-w-3xl space-y-5 py-2"
              >
                <div className="hidden sm:block che-flow-spine" aria-hidden />
                <div className="hidden sm:block che-flow-spine-glow" aria-hidden />

                {branch.hierarchy.map((node, i) => {
                  const accent = ROLE_ACCENT[node.role] || ROLE_ACCENT_DEFAULT;
                  const isRight = i % 2 === 1;
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
                      key={`${i}-${node.name}`}
                      variants={isRight ? nodeVariantsRight : nodeVariantsLeft}
                      className={`relative flex items-center ${isRight ? "flex-row" : "flex-row-reverse"}`}
                    >
                      <div className="hidden sm:block sm:flex-1" aria-hidden />
                      <div className="relative z-10 flex items-center justify-center w-10 sm:w-14 shrink-0">
                        <span className="che-flow-node-dot" title={`Level ${i + 1}`} />
                      </div>
                      <div className="flex-1 sm:max-w-md">
                        <PersonCard
                          node={node}
                          accent={accent}
                          testId={testId}
                          isLast={isLast}
                          isAdmin={isAdmin}
                          onEdit={() => {
                            setEditingPersonIndex(i);
                            setPersonFormOpen(true);
                          }}
                          onDelete={() => setDeletePersonIndex(i)}
                        />
                      </div>
                    </motion.div>
                  );
                })}

                {isAdmin && (
                  <div className="relative flex items-center flex-row-reverse">
                    <div className="hidden sm:block sm:flex-1" aria-hidden />
                    <div className="flex items-center justify-center w-10 sm:w-14 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-slate-300" aria-hidden />
                    </div>
                    <button
                      data-testid={BRANCH.addPersonButton}
                      onClick={() => {
                        setEditingPersonIndex(null);
                        setPersonFormOpen(true);
                      }}
                      className="flex-1 sm:max-w-md che-card border-dashed px-5 py-4 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add an officer to this chain
                    </button>
                  </div>
                )}

                {branch.hierarchy.length === 0 && !isAdmin && (
                  <p className="text-center text-slate-500 text-sm py-8">
                    No officers listed for this branch yet.
                  </p>
                )}
              </motion.div>
            </section>
          </>
        )}
      </AppShell>

      {branch && (
        <>
          <BranchFormDialog
            open={branchFormOpen}
            onOpenChange={setBranchFormOpen}
            initial={branch}
            onSubmit={handleBranchMetaSubmit}
          />

          <DeleteConfirm
            open={branchDeleteOpen}
            onOpenChange={setBranchDeleteOpen}
            title={`Delete "${branch.name}"?`}
            description="This removes the branch and its entire officer hierarchy permanently. This cannot be undone."
            onConfirm={handleBranchDelete}
          />

          <PersonFormDialog
            open={personFormOpen}
            onOpenChange={(v) => {
              setPersonFormOpen(v);
              if (!v) setEditingPersonIndex(null);
            }}
            initial={editingPersonIndex !== null ? branch.hierarchy[editingPersonIndex] : null}
            onSubmit={editingPersonIndex !== null ? handleEditPerson : handleAddPerson}
          />

          <DeleteConfirm
            open={deletePersonIndex !== null}
            onOpenChange={(v) => !v && setDeletePersonIndex(null)}
            title="Remove this officer?"
            description="This removes them from the branch's reporting chain. This cannot be undone."
            onConfirm={handleDeletePerson}
          />
        </>
      )}
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