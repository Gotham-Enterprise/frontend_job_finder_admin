import { FC } from "react";

import { StatusApproved, StatusDeclined, StatusPending } from "@/icons";
import { DocumentVerificationStatus } from "@/services/types/documentVerification";

interface Props {
  status: DocumentVerificationStatus;
}

const LABELS: Record<DocumentVerificationStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

const Status: FC<Props> = ({ status }) => {
  const renderIcon = () => {
    switch (status) {
      case "verified":
        return <StatusApproved />;
      case "rejected":
        return <StatusDeclined />;
      case "pending":
      default:
        return <StatusPending />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {renderIcon()}
      <span className="text-sm text-gray-900 dark:text-white">{LABELS[status] ?? status}</span>
    </div>
  );
};

export default Status;
