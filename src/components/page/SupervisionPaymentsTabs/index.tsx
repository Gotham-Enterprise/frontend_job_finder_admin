"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SupervisionPayments from "../SupervisionPayments";
import SupervisionMonthlyPayments from "../SupervisionMonthlyPayments";
import { useBillingWeeks } from "@/services/hooks/useSupervisionPayments";
import { useMonthlyPeriods } from "@/services/hooks/useSupervisionMonthlyPayments";

type PaymentsTab = "hourly" | "monthly";

/**
 * Supervision payments in one place: hourly billing weeks and monthly
 * (Medical Director) billing months, each tab showing how many items need
 * support's attention. The tab is kept in the URL (?tab=monthly).
 */
const SupervisionPaymentsTabs: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: PaymentsTab = searchParams.get("tab") === "monthly" ? "monthly" : "hourly";

  // Same "needs attention" filters as each list's default view.
  const hourlyAttention = useBillingWeeks({ page: 1, limit: 1, needsAttention: true });
  const monthlyAttention = useMonthlyPeriods({ page: 1, limit: 1, needsAttention: true });
  const counts: Record<PaymentsTab, number> = {
    hourly: hourlyAttention.data?.metaData?.totalCount ?? 0,
    monthly: monthlyAttention.data?.data?.needsAttentionCount ?? 0,
  };

  const selectTab = (next: PaymentsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "monthly") params.set("tab", "monthly");
    else params.delete("tab");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const tabs: { id: PaymentsTab; label: string }[] = [
    { id: "hourly", label: "Hourly (weekly)" },
    { id: "monthly", label: "Monthly (Medical Directors)" },
  ];

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Payment type" className="flex flex-wrap gap-2">
        {tabs.map(({ id, label }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectTab(id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {label}
              {counts[id] > 0 && (
                <span
                  title={`${counts[id]} needing attention`}
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                    selected ? "bg-white/20 text-white" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {counts[id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "monthly" ? <SupervisionMonthlyPayments /> : <SupervisionPayments />}
    </div>
  );
};

export default SupervisionPaymentsTabs;
