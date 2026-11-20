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
import { useMonthlyPeriods } from "@/services/hooks/useSupervisionMonthlyPayments";
import { MonthlyPeriodFilters, MonthlyPeriodStatus } from "@/services/types/supervisionMonthlyPayments";
import { formatCents } from "@/services/utils/supervisionPaymentsFormat";
import {
  MONTH_STATUS_CLASS,
  MONTH_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  monthAttention,
} from "./format";

const TABLE_COLUMNS = [
  { key: "month", label: "Month" },
  { key: "parties", label: "Client → Medical Director" },
  { key: "status", label: "Status" },
  { key: "charged", label: "Charged" },
  { key: "payout", label: "Paid out" },
  { key: "refund", label: "Refunded" },
  { key: "actions", label: "", className: "text-right" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...(Object.keys(MONTH_STATUS_LABEL) as MonthlyPeriodStatus[]).map((value) => ({
    value,
    label: MONTH_STATUS_LABEL[value],
  })),
];

const ITEMS_PER_PAGE_OPTIONS = ["10", "25", "50"].map((value) => ({ value, label: value }));

/** Months of in-app monthly (Medical Director) hires, for Gotham support. */
const SupervisionMonthlyPayments: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<MonthlyPeriodFilters>({ page: 1, limit: 10, needsAttention: true });
  const { data, isLoading, error, refetch } = useMonthlyPeriods(filters);

  const updateFilters = (next: Partial<MonthlyPeriodFilters>) =>
    startTransition(() => setFilters((prev) => ({ ...prev, page: 1, ...next })));

  if (error && !isPending) {
    return (
      <ErrorState
        message={`Error loading monthly payments: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  const result = data?.data;
  const limit = filters.limit || 10;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Monthly Payments</h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Medical Director retainers billed monthly in the app · {result?.total || 0} months
              {filters.needsAttention ? " needing attention" : ""}
              {isPending && <span className="ml-2 text-xs text-primary">Updating...</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleSwitch
              id="monthly-needs-attention"
              label="Needs attention"
              checked={Boolean(filters.needsAttention)}
              onChange={(checked) => updateFilters({ needsAttention: checked })}
            />
            <Select
              value={filters.status ?? ""}
              onChange={(value) => updateFilters({ status: (value || undefined) as MonthlyPeriodStatus | undefined })}
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
            placeholder="Search by Medical Director or client name or email..."
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
                <TableCell colSpan={TABLE_COLUMNS.length} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading monthly payments...
                </TableCell>
              </TableRow>
            ) : !result?.periods.length ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMNS.length} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {filters.needsAttention ? "Nothing needs attention right now." : "No monthly payments found."}
                </TableCell>
              </TableRow>
            ) : (
              result.periods.map((period) => {
                const attention = monthAttention(period);
                return (
                  <TableRow
                    key={period.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {period.label}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                        {period.hire?.supervisee.fullName || period.hire?.supervisee.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                        → {period.hire?.supervisor.fullName || period.hire?.supervisor.email}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MONTH_STATUS_CLASS[period.status]}`}>
                        {MONTH_STATUS_LABEL[period.status]}
                      </span>
                      {attention && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-700 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {attention}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      <p className="text-gray-900 dark:text-white">{formatCents(period.totalCents)}</p>
                      <p className={`text-xs ${PAYMENT_STATUS_CLASS[period.paymentStatus]}`}>
                        {PAYMENT_STATUS_LABEL[period.paymentStatus]}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {period.status === "SETTLED" ? formatCents(period.supervisorAmountCents) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {period.status === "SETTLED" ? formatCents(period.refundCents) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/admin/supervision-payments/monthly/${period.id}`)}
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

      {result && result.periods.length ? (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(result.page - 1) * limit + 1} to {Math.min(result.page * limit, result.total)} of {result.total}{" "}
              results
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
                <Select
                  value={limit.toString()}
                  onChange={(value) => updateFilters({ limit: parseInt(value, 10) })}
                  options={ITEMS_PER_PAGE_OPTIONS}
                  className="w-auto min-w-[120px]"
                />
              </div>
              <Pagination
                currentPage={result.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SupervisionMonthlyPayments;
