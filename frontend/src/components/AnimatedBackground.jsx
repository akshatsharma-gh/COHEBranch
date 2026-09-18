import React from "react";
import { motion } from "framer-motion";

/**
 * Soft, slow-moving gradient blobs used to give pages a modern, "alive"
 * backdrop without the cost/complexity of a full 3D scene. Purely
 * decorative — always aria-hidden and pointer-events: none.
 */
export default function AnimatedBackground({ variant = "default", className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <motion.div
        className="che-blob w-[420px] h-[420px] bg-violet-500/25"
        style={{ top: "-12%", left: "-6%" }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="che-blob w-[520px] h-[520px] bg-cyan-400/15"
        style={{ bottom: "-18%", right: "-10%" }}
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -20, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      {variant === "rich" && (
        <motion.div
          className="che-blob w-[320px] h-[320px] bg-amber-400/20"
          style={{ top: "38%", left: "48%" }}
          animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div className="absolute inset-0 che-grain" />
    </div>
  );
}
