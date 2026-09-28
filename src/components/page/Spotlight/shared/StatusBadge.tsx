import { FC } from "react";

import Badge from "@/components/ui/badge/Badge";
import { SpotlightStatus } from "@/services/types/spotlight";

import { REVIEW_TARGET_HOURS, STATUS_LABELS, formatWaiting } from "./utils";

const STATUS_COLORS: Record<SpotlightStatus, "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> = {
  pending_verification: "warning",
  submitted: "warning",
  changes_requested: "info",
  approved: "success",
  rejected: "error",
  suspended: "error",
  paused: "light",
  draft: "light",
  archived: "dark",
};

export const StatusBadge: FC<{ status: SpotlightStatus }> = ({ status }) => (
  <Badge size="sm" color={STATUS_COLORS[status] ?? "light"}>
    {STATUS_LABELS[status] ?? status}
  </Badge>
);

/** How long an item has waited for review, red once it's past the review target. */
export const WaitingBadge: FC<{ hours: number | null | undefined; type: keyof typeof REVIEW_TARGET_HOURS }> = ({
  hours,
  type,
}) => {
  if (hours === null || hours === undefined) return <span className="text-sm text-gray-500">—</span>;
  const overdue = hours > REVIEW_TARGET_HOURS[type];
  return (
    <Badge size="sm" color={overdue ? "error" : "light"}>
      {formatWaiting(hours)}
      {overdue ? " · overdue" : ""}
    </Badge>
  );
};
