"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ErrorState from "@/components/common/ErrorState";
import {
  useLandlords,
  useToggleLandlordInternal,
} from "@/services/hooks/useOfficeSpaceLandlords";
import {
  OfficeSpaceLandlord,
  OfficeSpaceLandlordFilters,
} from "@/services/types/officeSpace";

const DEFAULT_FILTERS: OfficeSpaceLandlordFilters = {
  page: 1,
  limit: 20,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const LandlordListings: React.FC = () => {
  const [filters, setFilters] = useState<OfficeSpaceLandlordFilters>(
    DEFAULT_FILTERS
  );
  const [searchInput, setSearchInput] = useState("");
  const [toggling, setToggling] = useState<OfficeSpaceLandlord | null>(null);
  const [pendingValue, setPendingValue] = useState(false);

  const { data, isLoading, error, refetch } = useLandlords(filters);
  const toggleInternal = useToggleLandlordInternal();

  const applyFilter = (patch: Partial<OfficeSpaceLandlordFilters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyFilter({ search: searchInput || undefined });
  };

  const requestToggle = (landlord: OfficeSpaceLandlord) => {
    setToggling(landlord);
    setPendingValue(!landlord.isInternal);
  };

  const confirmToggle = async () => {
    if (!toggling) return;
    await toggleInternal.mutateAsync({
      id: toggling.id,
      isInternal: pendingValue,
    });
    setToggling(null);
  };

  if (error) {
    return (
      <ErrorState
        message={`Error loading landlords: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  const metaData = data?.metaData;
  const landlords = data?.data ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Landlords
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metaData?.total?.toLocaleString() ?? 0} total
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search name, business, email"
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFilter({ search: searchInput || undefined })}
          >
            Search
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setFilters(DEFAULT_FILTERS);
            }}
          >
            Reset
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium text-right">Listings</th>
                <th className="px-6 py-3 font-medium">Own listings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {landlords.map((landlord) => (
                <tr
                  key={landlord.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {landlord.businessName || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <div>
                      {[landlord.user.firstName, landlord.user.lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {landlord.user.email || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {[landlord.businessCity, landlord.businessState]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                    {landlord._count?.listings ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2">
                      {landlord.isInternal && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Own
                        </span>
                      )}
                      <ToggleSwitch
                        id={`own-listing-toggle-${landlord.id}`}
                        label=""
                        checked={landlord.isInternal}
                        onChange={() => requestToggle(landlord)}
                      />
                    </span>
                  </td>
                </tr>
              ))}

              {!isLoading && landlords.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No landlords found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {metaData && metaData.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {metaData.page} of {metaData.totalPages} ({metaData.total} total)
            </p>
            <select
              value={filters.limit?.toString() || "20"}
              onChange={(e) => applyFilter({ limit: parseInt(e.target.value) })}
              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size.toString()}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={metaData.page <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={metaData.page >= metaData.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={toggling !== null}
        onClose={() => setToggling(null)}
        showCloseButton={false}
        isFullscreen={false}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {pendingValue ? "Mark as own listing?" : "Unmark own listing?"}
          </h2>
          {pendingValue ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {toggling?.businessName || toggling?.user.email}
              </span>{" "}
              will be treated as a Gotham-managed landlord. Their listings
              publish without going through the Stripe property post gateway.
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {toggling?.businessName || toggling?.user.email}
              </span>{" "}
              will no longer be treated as Gotham-managed. Their listings will
              again require the paid property post credit to publish.
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setToggling(null)}
              disabled={toggleInternal.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={pendingValue ? "default" : "destructive"}
              onClick={confirmToggle}
              disabled={toggleInternal.isPending}
            >
              {toggleInternal.isPending
                ? pendingValue
                  ? "Marking…"
                  : "Unmarking…"
                : pendingValue
                  ? "Mark as own"
                  : "Unmark"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandlordListings;