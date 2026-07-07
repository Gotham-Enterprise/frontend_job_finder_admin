import React from "react";

const baseClass =
  "inline-flex items-center justify-center gap-1 rounded-sm px-2.5 py-0.5 font-medium whitespace-nowrap text-theme-xs uppercase";

// Uniform admin-table badge palette: two greens only for now.
// dark  -> brand green (#006D36), used for positive/primary states
// light -> soft emerald with ring, used for every other state
const toneClass = {
  dark: "bg-brand-500 text-white shadow-sm dark:bg-brand-500 dark:text-white",
  light:
    "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/50",
} as const;

export type StatusBadgeTone = keyof typeof toneClass;

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, children, className = "" }) => {
  return <span className={`${baseClass} ${toneClass[tone]} ${className}`.trim()}>{children}</span>;
};

export default StatusBadge;
