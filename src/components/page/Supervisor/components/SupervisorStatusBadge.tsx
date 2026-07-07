import React from "react";
import { VerificationStatus } from "@/services/types/supervisor";
import StatusBadge, { StatusBadgeTone } from "../../../ui/badge/StatusBadge";

// Two-green palette for now: APPROVED gets the dark brand green,
// everything else gets the light green.
const statusTone: Record<VerificationStatus, StatusBadgeTone> = {
  APPROVED: "dark",
  PENDING: "light",
  REJECTED: "light",
};

interface SupervisorStatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const SupervisorStatusBadge: React.FC<SupervisorStatusBadgeProps> = ({ status, className = "" }) => {
  return (
    <StatusBadge tone={statusTone[status]} className={className}>
      {status}
    </StatusBadge>
  );
};

export default SupervisorStatusBadge;
