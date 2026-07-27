import React from "react";
import { Eye, EyeOff } from "lucide-react";
import StatusBadge from "./StatusBadge";

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
    <StatusBadge tone={hidden ? "light" : "dark"} className={className}>
      {hidden ? (
        <>
          <EyeOff size={12} className="shrink-0" /> Hidden
        </>
      ) : (
        <>
          <Eye size={12} className="shrink-0" /> Shown
        </>
      )}
    </StatusBadge>
  );
};

export default VisibilityBadge;
