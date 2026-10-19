"use client";
import React from "react";
import { useSupervisorInAppPayments } from "@/services/hooks/useSupervisionPayments";

/**
 * In-app payments payout status for one supervisor. While the platform flag is
 * on, every supervisor's non-monthly hires use hourly, in-app billed agreements;
 * the only prerequisite is a finished payout account.
 */
const InAppPaymentsCard: React.FC<{ supervisorId: string }> = ({ supervisorId }) => {
  const { data, isLoading, error } = useSupervisorInAppPayments(supervisorId);
  const status = data?.data;

  const payout = !status
    ? null
    : status.payoutsEnabled
      ? { text: "Ready to receive payouts", className: "text-green-700 dark:text-green-400" }
      : status.payoutAccountCreated
        ? { text: "Payout setup not finished", className: "text-amber-700 dark:text-amber-400" }
        : { text: "Payouts not set up", className: "text-gray-500 dark:text-gray-400" };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          In-App Payments
        </h3>
      </div>
      <div className="px-6 py-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : error || !status ? (
          <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load the in-app payments status.</p>
        ) : (
          <>
            {payout && <p className={`text-sm ${payout.className}`}>{payout.text}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hourly, in-app billed agreements are on for all supervisors. This supervisor must finish
              payout setup (Billing &amp; Invoices → Payouts) before they can send one.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default InAppPaymentsCard;
