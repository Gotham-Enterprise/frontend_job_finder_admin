import React from "react";

const baseClass =
  "inline-flex items-center justify-center gap-1 rounded-sm px-2.5 py-0.5 font-medium whitespace-nowrap text-theme-xs uppercase";

// Mirror the supervisor Status column (SupervisorStatusBadge):
// Verified -> APPROVED color, Unverified -> PENDING color.
const verifiedClass =
  "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-white";
const unverifiedClass =
  "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/50";

interface EmailVerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

const EmailVerifiedBadge: React.FC<EmailVerifiedBadgeProps> = ({
  verified,
  className = "",
}) => {
  return (
    <span
      className={`${baseClass} ${verified ? verifiedClass : unverifiedClass} ${className}`.trim()}
    >
      {verified ? "Verified" : "Unverified"}
    </span>
  );
};

export default EmailVerifiedBadge;
