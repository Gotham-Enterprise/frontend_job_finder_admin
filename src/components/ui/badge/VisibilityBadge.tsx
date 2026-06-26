import React from "react";
import { Eye, EyeOff } from "lucide-react";

const baseClass =
  "inline-flex items-center justify-center gap-1 rounded-sm px-2.5 py-0.5 font-medium whitespace-nowrap text-theme-xs";

// Shown -> neutral/positive, Hidden -> amber so admins can spot profiles
// that are not visible in the Find a Supervisor app at a glance.
const shownClass =
  "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/50";
const hiddenClass =
  "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-700/50";

interface VisibilityBadgeProps {
  /** True when the profile is hidden from the Find a Supervisor app. */
  hidden: boolean;
  className?: string;
}

const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
  hidden,
  className = "",
}) => {
  return (
    <span className={`${baseClass} ${hidden ? hiddenClass : shownClass} ${className}`.trim()}>
      {hidden ? (
        <>
          <EyeOff size={12} className="shrink-0" /> Hidden
        </>
      ) : (
        <>
          <Eye size={12} className="shrink-0" /> Shown
        </>
      )}
    </span>
  );
};

export default VisibilityBadge;
