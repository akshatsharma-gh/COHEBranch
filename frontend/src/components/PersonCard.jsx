import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, CalendarDays } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function initials(name) {
  return name
    .replace(/^(Dr\.|Adv\.|Prof\.|Inspector|Head Const\.|Sister)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

/**
 * A single node in the branch hierarchy.
 * - Desktop: hover reveals the detail popover.
 * - Touch / keyboard: tap or focus toggles it, so it still works on mobile.
 */
export default function PersonCard({ node, accent, testId, isLast }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="che-card px-5 py-4 flex items-center gap-4 cursor-pointer select-none"
      >
        <Avatar className={`w-12 h-12 ring-4 ${accent.ring} shrink-0`}>
          <AvatarImage src={node.avatar} alt={node.name} />
          <AvatarFallback className="bg-slate-900 text-amber-400 font-semibold text-sm">
            {initials(node.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span
              data-testid={testId?.name}
              className="font-semibold text-slate-900 truncate"
            >
              {node.name}
            </span>
            <span
              data-testid={testId?.role}
              className={`text-[10px] uppercase tracking-widest font-semibold border rounded-full px-2 py-0.5 ${accent.badge}`}
            >
              {node.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Level {node.level + 1}
            {!isLast ? " · Reports up to the officer above" : " · Base of chain"}
          </p>
        </div>

        <span className="text-[10px] uppercase tracking-widest text-slate-400 hidden sm:inline shrink-0">
          {open ? "Hide" : "Details"}
        </span>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute z-20 right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-[calc(100%-0rem)] sm:w-80 che-glass che-card p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={node.avatar} alt={node.name} />
                <AvatarFallback className="bg-slate-900 text-amber-400">
                  {initials(node.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{node.name}</p>
                <p className="text-xs text-slate-500">{node.role}</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              {node.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{node.email}</span>
                </div>
              )}
              {node.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{node.phone}</span>
                </div>
              )}
              {node.joined && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>With CHE since {node.joined}</span>
                </div>
              )}
            </div>

            {node.bio && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                {node.bio}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
