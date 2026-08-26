import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { ListingStatus, InquiryStatus } from "@/services/types/officeSpace";

type StatusValue = ListingStatus | InquiryStatus;

interface OfficeSpaceStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { color: "success" | "warning" | "error" | "info" | "light" | "dark"; label: string }
> = {
  [ListingStatus.ACTIVE]: { color: "success", label: "Active" },
  [ListingStatus.DRAFT]: { color: "light", label: "Draft" },
  [ListingStatus.PENDING_REVIEW]: { color: "warning", label: "Pending Review" },
  [ListingStatus.INACTIVE]: { color: "error", label: "Inactive" },
  [ListingStatus.ARCHIVED]: { color: "light", label: "Archived" },
  [ListingStatus.RENTED]: { color: "info", label: "Rented" },
  [InquiryStatus.NEW]: { color: "warning", label: "New" },
  [InquiryStatus.PENDING]: { color: "warning", label: "Pending" },
  [InquiryStatus.CONTACTED]: { color: "info", label: "Contacted" },
  [InquiryStatus.TOUR_SCHEDULED]: { color: "info", label: "Tour Scheduled" },
  [InquiryStatus.APPLICATION_RECEIVED]: { color: "success", label: "Application Received" },
  [InquiryStatus.CLOSED]: { color: "light", label: "Closed" },
};

const OfficeSpaceStatusBadge: React.FC<OfficeSpaceStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STATUS_CONFIG[status] || { color: "light" as const, label: status };
  return (
    <Badge color={config.color} size="sm" className={className}>
      {config.label}
    </Badge>
  );
};

export default OfficeSpaceStatusBadge;
