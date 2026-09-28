import React from "react";
import { formatDate } from "@/services/utils/dateUtils";
import StatusBadge from "../../../ui/badge/StatusBadge";
import { SupervisorSubscriptionSummary } from "@/services/types/supervisor";

interface SubscriptionCellProps {
  subscription: SupervisorSubscriptionSummary | null;
}

/**
 * Paid/Free badge with the plan name and billing period stacked beneath.
 * Free-plan rows skip the period, matching the supervisor detail page.
 */
const SubscriptionCell: React.FC<SubscriptionCellProps> = ({ subscription }) => {
  if (!subscription) {
    return <span className="text-sm text-gray-400 italic">No subscription</span>;
  }

  const { isPaid, status, planName, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd } =
    subscription;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <StatusBadge tone={isPaid ? "dark" : "light"}>{isPaid ? "Paid" : "Free"}</StatusBadge>
        {status === "TRIALING" && <StatusBadge tone="light">Trial</StatusBadge>}
      </div>
      {planName && (
        <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
          {planName}
        </p>
      )}
      {isPaid && (currentPeriodStart || currentPeriodEnd) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(currentPeriodStart, "—")} – {formatDate(currentPeriodEnd, "—")}
        </p>
      )}
      {isPaid && cancelAtPeriodEnd && (
        <p className="text-xs text-amber-600 dark:text-amber-400">Cancels at period end</p>
      )}
    </div>
  );
};

export default SubscriptionCell;
