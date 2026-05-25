import React from "react";
import { VerificationStatus } from "@/services/types/supervisor";

const baseClass =
  "inline-flex items-center justify-center gap-1 rounded-sm px-2.5 py-0.5 font-medium whitespace-nowrap text-theme-xs";

const statusClass: Record<VerificationStatus, string> = {
  APPROVED:
    "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-white",
  PENDING:
    "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/50",
  REJECTED:
    "bg-error-50 text-error-700 ring-1 ring-inset ring-error-200/90 dark:bg-error-500/15 dark:text-error-400 dark:ring-error-800/50",
};

interface SupervisorStatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const SupervisorStatusBadge: React.FC<SupervisorStatusBadgeProps> = ({ status, className = "" }) => {
  return (
    <span className={`${baseClass} ${statusClass[status]} ${className}`.trim()}>{status}</span>
  );
};

export default SupervisorStatusBadge;
