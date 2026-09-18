import React from "react";
import * as Icons from "lucide-react";

// Safe icon renderer — falls back to Landmark if the name is unknown.
export default function BranchIcon({ name, className = "w-5 h-5", strokeWidth = 1.75 }) {
  const Cmp = (name && Icons[name]) || Icons.Landmark;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
