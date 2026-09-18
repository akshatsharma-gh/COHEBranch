import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import BranchIcon from "@/components/BranchIcon";
import dheLogo from "@/assets/dhe-crest.png";

const FALLBACK_EMBLEM_TARGET = { x: 42, y: 32 };

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

function spiralFallback(index, total, cx, cy, w, h) {
  const n = Math.max(total, 1);
  const R = Math.min(w, h) * 0.4;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const r = R * Math.sqrt((index + 0.5) / n);
  const theta = index * golden;
  return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) * 0.6 };
}

// A tight cluster right around the emblem — where every chip first
// materializes and briefly hovers, before it flies off to its real spot.
function clusterPosition(index, total, cx, cy) {
  const n = Math.max(total, 1);
  const R = 190;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const r = R * Math.sqrt((index + 0.5) / n);
  const theta = index * golden;
  return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
}

/**
 * One-time full-screen intro: the DHE crest forms center-stage, then
 * shatters into a chip per branch that flies to that branch's ACTUAL card
 * position in the (already-rendered, hidden-behind-this-overlay) dashboard
 * grid — so for a moment you see them physically settle into place —
 * while the crest itself shrinks up into the header. Then it all dissolves
 * to reveal the real page, already sitting exactly where the chips landed.
 */
export default function IntroSequence({ branches, getCardRect, onComplete }) {
  const { w, h } = useViewportSize();
  const cx = w / 2;
  const cy = h / 2 - 10;
  const [phase, setPhase] = useState("enter"); // enter -> hold -> materialize -> travel -> link -> exit
  const [targets, setTargets] = useState(null); // { [branchId]: {x,y} }, measured at travel time
  const emblemTargetRef = useRef(FALLBACK_EMBLEM_TARGET);

  const chips = useMemo(
    () => branches.map((b, i) => ({ branch: b, delay: 0.02 * i })),
    [branches]
  );
  const cluster = useMemo(
    () => branches.map((b, i) => clusterPosition(i, branches.length, cx, cy)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches, cx, cy]
  );

  useEffect(() => {
    // Lock scroll for the duration so measured positions stay valid.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const measureAndTravel = () => {
      const headerEl = document.getElementById("che-header-logo");
      if (headerEl) {
        const r = headerEl.getBoundingClientRect();
        emblemTargetRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      const computed = {};
      branches.forEach((b, i) => {
        const rect = getCardRect?.(b.id);
        computed[b.id] =
          rect && rect.width > 0
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : spiralFallback(i, branches.length, cx, cy, w, h);
      });
      setTargets(computed);
      setPhase("travel");
    };

    const HOLD = 750; // crest finishes forming, title fades in
    const MATERIALIZE = HOLD; // chips start popping into view around the crest
    const MATERIALIZE_HOLD = 1150; // ...and hang there a moment so you can see them all
    const TRAVEL = MATERIALIZE + MATERIALIZE_HOLD; // then fly out to their real dashboard spot
    const LINK = TRAVEL + 1650; // wait for the slowest chip, then draw links
    const EXIT = LINK + 500;
    const DONE = EXIT + 600;

    const timers = [
      setTimeout(() => setPhase("hold"), HOLD),
      setTimeout(() => setPhase("materialize"), MATERIALIZE),
      setTimeout(measureAndTravel, TRAVEL),
      setTimeout(() => setPhase("link"), LINK),
      setTimeout(() => setPhase("exit"), EXIT),
      setTimeout(() => onComplete?.(), DONE),
    ];
    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settled = phase === "travel" || phase === "link" || phase === "exit";
  const materialized = phase === "materialize" || settled;
  const emblemTarget = emblemTargetRef.current;

  return (
    <motion.div
      className="fixed inset-0 z-[100] che-intro-backdrop overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      aria-hidden
    >
      <div className="che-intro-scangrid" />

      {(phase === "link" || phase === "exit") && targets && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="che-aurora-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {chips.map((c) => {
            const t = targets[c.branch.id];
            if (!t) return null;
            return (
              <motion.line
                key={c.branch.id}
                x1={emblemTarget.x}
                y1={emblemTarget.y}
                x2={t.x}
                y2={t.y}
                stroke="url(#che-aurora-line)"
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.6 }}
              />
            );
          })}
        </svg>
      )}

      {chips.map((c, i) => {
        const t = targets?.[c.branch.id];
        const clusterPos = cluster[i];
        // Three stops: hidden at the crest -> visible, clustered around the
        // crest -> flown out to the real dashboard card position.
        const pos = settled ? t || clusterPos : materialized ? clusterPos : { x: cx, y: cy };
        const visible = materialized;

        return (
          <motion.div
            key={c.branch.id}
            className="absolute"
            style={{ left: 0, top: 0 }}
            initial={{ x: cx, y: cy, opacity: 0 }}
            animate={{ x: pos.x, y: pos.y, opacity: visible ? 1 : 0 }}
            transition={{
              type: "spring",
              stiffness: phase === "materialize" ? 140 : 90,
              damping: phase === "materialize" ? 16 : 15,
              delay: phase === "materialize" || phase === "travel" ? c.delay : 0,
            }}
          >
            <motion.div
              className="che-chip"
              style={{ x: "-50%", y: "-50%" }}
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: visible ? 1 : 0, rotate: visible ? 0 : -25 }}
              transition={{
                type: "spring",
                stiffness: phase === "materialize" ? 140 : 90,
                damping: phase === "materialize" ? 16 : 15,
                delay: phase === "materialize" || phase === "travel" ? c.delay : 0,
              }}
            >
              <BranchIcon name={c.branch.icon} className="w-7 h-7" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Positioning layer: purely animates the anchor point (center vs. header) */}
      <motion.div
        className="absolute"
        style={{ left: 0, top: 0 }}
        initial={{ x: cx, y: cy, opacity: 0 }}
        animate={
          phase === "enter"
            ? { x: cx, y: cy, opacity: 0 }
            : settled
            ? { x: emblemTarget.x, y: emblemTarget.y, opacity: 1 }
            : { x: cx, y: cy, opacity: 1 }
        }
        transition={{ duration: settled ? 0.9 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Centering layer: plain CSS, unaffected by scale below — always
            keeps the emblem's true visual center on the anchor point above,
            regardless of the title text's width. This is what the old
            version got wrong. */}
        <div style={{ transform: "translate(-50%, -50%)" }}>
          {/* Scale layer: shrinks around its own center once settled */}
          <motion.div
            className="flex flex-col items-center"
            animate={{ scale: settled ? 0.24 : 1 }}
            transition={{ duration: settled ? 0.9 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {!settled && <div className="che-emblem-glow animate-pulse" />}
              <img
                src={dheLogo}
                alt="Government of Haryana"
                className="relative w-40 h-40 object-contain drop-shadow-[0_10px_35px_rgba(217,119,6,0.35)]"
              />
            </div>
            {!settled && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: phase === "hold" ? 1 : phase === "enter" ? 0.9 : 0, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-6 text-center px-6 whitespace-nowrap"
              >
                <p className="text-white font-display text-2xl sm:text-3xl">
                  Directorate of Higher Education
                </p>
                <p className="text-slate-400 text-sm mt-1 tracking-wide">
                  Centre of Higher Education, Haryana
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}