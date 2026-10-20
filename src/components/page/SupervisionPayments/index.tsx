"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye } from "lucide-react";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";
import Input from "../../ui/input/Input";
import Select from "../../form/Select";
import Pagination from "../../tables/Pagination";
import ToggleSwitch from "../../ui/ToggleSwitch";
import { SearchIcon } from "../../ui/icons";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import TableHeading from "../../tables/tableHeader";
import { useBillingWeeks, usePaymentsSummary } from "@/services/hooks/useSupervisionPayments";
import type { PaymentsSummary } from "@/services/types/supervisionPayments";
import {
  BillingWeek,
  BillingWeekFilters,
  BillingWeekStatus,
} from "@/services/types/supervisionPayments";
import {
  PREPAY_STATUS_CLASS,
  PREPAY_STATUS_LABEL,
  WEEK_STATUS_CLASS,
  WEEK_STATUS_LABEL,
  formatCents,
  formatMinutes,
  formatWeekRange,
} from "@/services/utils/supervisionPaymentsFormat";

const TABLE_COLUMNS = [
  { key: "week", label: "Week" },
  { key: "parties", label: "Supervisee → Supervisor" },
  { key: "status", label: "Status" },
  { key: "hours", label: "Hours" },
  { key: "charged", label: "Prepay" },
  { key: "payout", label: "Paid out" },
  { key: "refund", label: "Refunded" },
  { key: "actions", label: "", className: "text-right" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...(Object.keys(WEEK_STATUS_LABEL) as BillingWeekStatus[]).map((value) => ({
    value,
    label: WEEK_STATUS_LABEL[value],
  })),
];

const ITEMS_PER_PAGE_OPTIONS = ["10", "25", "50"].map((value) => ({ value, label: value }));

/** What needs a support action on this week, if anything. */
function attentionLabel(week: BillingWeek): string | null {
  if (week.status === "DISPUTED") return "Dispute to resolve";
  if (week.failedLateCharges > 0) return "Late charge failed";
  if (week.pendingLateEntryRequests > 0) return "Late entry requested";
  if (week.prepayStatus === "FAILED" && week.status !== "SETTLED") return "Prepay failed";
  if (week.pendingLateEntries > 0) return "Late entry awaiting supervisee";
  return null;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

/**
 * Platform revenue cards: the 10% fee is not a Stripe line item (separate
 * charges and transfers keep it as leftover balance), so this is where Gotham
 * sees it directly.
 */
function PaymentsSummaryCards({ summary, loading }: { summary: PaymentsSummary | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }
  if (!summary) return null;
  const month = new Date(summary.monthStart).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "America/New_York",
  });
  const settled = summary.settledWeeks;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={`Platform fees · ${month}`}
        value={formatCents(summary.platformFees.thisMonthCents)}
        hint={`${settled.thisMonth} settled week${settled.thisMonth === 1 ? "" : "s"} this month`}
      />
      <StatCard
        label="Platform fees · all time"
        value={formatCents(summary.platformFees.allTimeCents)}
        hint={`${settled.allTime} settled week${settled.allTime === 1 ? "" : "s"}`}
      />
      <StatCard
        label="In progress (estimated)"
        value={formatCents(summary.platformFees.inProgressEstimateCents)}
        hint={`${summary.inProgressWeeks} prepaid week${summary.inProgressWeeks === 1 ? "" : "s"} not yet settled`}
      />
      <StatCard
        label={`Charged to supervisees · ${month}`}
        value={formatCents(summary.chargedVolume.thisMonthCents)}
        hint={`${formatCents(summary.chargedVolume.allTimeCents)} all time, before refunds`}
      />
    </div>
  );
}

/** Billing weeks of in-app (hourly) supervision hires, for Gotham support. */
const SupervisionPayments: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<BillingWeekFilters>({
    page: 1,
    limit: 10,
    needsAttention: true,
  });
  const { data, isLoading, error, refetch } = useBillingWeeks(filters);
  const { data: summaryData, isLoading: summaryLoading } = usePaymentsSummary();

  const updateFilters = (next: Partial<BillingWeekFilters>) =>
    startTransition(() => setFilters((prev) => ({ ...prev, page: 1, ...next })));

  if (error && !isPending) {
    return (
      <ErrorState
        message={`Error loading payments: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  const metaData = data?.metaData;
  const limit = filters.limit || 10;

  return (
    <div className="space-y-6">
      <PaymentsSummaryCards summary={summaryData?.data} loading={summaryLoading} />

    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Supervision Payments
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {metaData?.totalCount || 0} billing weeks
              {filters.needsAttention ? " needing attention" : ""}
              {isPending && <span className="ml-2 text-xs text-primary">Updating...</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleSwitch
              id="needs-attention"
              label="Needs attention"
              checked={Boolean(filters.needsAttention)}
              onChange={(checked) => updateFilters({ needsAttention: checked })}
            />
            <Select
              value={filters.status ?? ""}
              onChange={(value) =>
                updateFilters({ status: (value || undefined) as BillingWeekStatus | undefined })
              }
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              className="w-auto min-w-[160px]"
            />
          </div>
        </div>
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by supervisor or supervisee name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilters({ keyword: searchInput || undefined });
            }}
            className="w-full pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeading columns={TABLE_COLUMNS} />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMNS.length}
                  className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMNS.length}
                  className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {filters.needsAttention
                    ? "Nothing needs attention right now."
                    : "No billing weeks found."}
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((week) => {
                const attention = attentionLabel(week);
                return (
                  <TableRow
                    key={week.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatWeekRange(week.startDate, week.endDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                        {week.hire.supervisee.fullName || week.hire.supervisee.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                        → {week.hire.supervisor.fullName || week.hire.supervisor.email}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${WEEK_STATUS_CLASS[week.status]}`}
                      >
                        {WEEK_STATUS_LABEL[week.status]}
                      </span>
                      {attention && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-700 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {attention}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatMinutes(week.loggedMinutes)} / {formatMinutes(week.terms.weeklyCapMinutes)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      <p className="text-gray-900 dark:text-white">{formatCents(week.totalCents)}</p>
                      <p className={`text-xs ${PREPAY_STATUS_CLASS[week.prepayStatus]}`}>
                        {PREPAY_STATUS_LABEL[week.prepayStatus]}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCents(week.supervisorAmountCents)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCents(week.refundCents)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/admin/supervision-payments/details/${week.id}`)}
                        title="View details"
                        className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors"
                      >
                        <Eye size={16} className="shrink-0" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {metaData && data?.data?.length ? (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(metaData.page - 1) * limit + 1} to{" "}
              {Math.min(metaData.page * limit, metaData.totalCount)} of {metaData.totalCount} results
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Items per page:
                </span>
                <Select
                  value={limit.toString()}
                  onChange={(value) => updateFilters({ limit: parseInt(value, 10) })}
                  options={ITEMS_PER_PAGE_OPTIONS}
                  className="w-auto min-w-[120px]"
                />
              </div>
              <Pagination
                currentPage={metaData.page}
                totalPages={metaData.totalPages}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </div>
  );
};

export default SupervisionPayments;
