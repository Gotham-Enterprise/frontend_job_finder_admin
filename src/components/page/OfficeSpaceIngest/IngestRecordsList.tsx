"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw, Search, UserCheck } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import ErrorState from "@/components/common/ErrorState";
import IngestRecordsTable from "./IngestRecordsTable";
import AssignLandlordModal from "./AssignLandlordModal";
import EditIngestRecordModal from "./EditIngestRecordModal";
import { useClearIngestRecords, useDeleteIngestRecord, useIngestRecords } from "@/services/hooks/useOfficeSpaceIngest";
import { IngestRecord, IngestRecordFilters } from "@/services/types/officeSpaceIngest";

const DEFAULT_FILTERS: IngestRecordFilters = {
  page: 1,
  limit: 20,
  sortBy: "lastSeenAt",
  sortOrder: "desc",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const IngestRecordsList: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<IngestRecordFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignIds, setAssignIds] = useState<string[] | null>(null);
  const [editing, setEditing] = useState<IngestRecord | null>(null);
  const [deleting, setDeleting] = useState<IngestRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const { data, isLoading, error, refetch } = useIngestRecords(filters);
  const deleteRecord = useDeleteIngestRecord();
  const clearIngest = useClearIngestRecords();

  const applyFilter = (patch: Partial<IngestRecordFilters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
    setSelectedIds([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyFilter({ search: searchInput || undefined });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const records = data?.data ?? [];
    const allSelected = records.every((r) => selectedIds.includes(r.id));
    setSelectedIds(allSelected ? [] : records.map((r) => r.id));
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteRecord.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const handleClear = async () => {
    await clearIngest.mutateAsync();
    setConfirmClear(false);
    setSelectedIds([]);
  };

  if (error) {
    return (
      <ErrorState
        message={`Error loading ingest records: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  const metaData = data?.metaData;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Ingest records
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metaData?.totalCount?.toLocaleString() ?? 0} total
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search address, description, URL"
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
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
            onClick={() => setConfirmClear(true)}
            disabled={clearIngest.isPending}
          >
            Clear all
          </Button>

          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 border-b border-blue-200 bg-blue-50 px-6 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {selectedIds.length} selected
          </p>
          <div className="ml-auto flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAssignIds(selectedIds)}
            >
              <UserCheck className="h-4 w-4" />
              Assign landlord
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <IngestRecordsTable
        data={data}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onView={(id) => router.push(`/admin/office-space-ingest/records/${id}`)}
        onEdit={setEditing}
        onDelete={setDeleting}
        onAssign={(ids) => setAssignIds(ids)}
      />

      {metaData && metaData.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {metaData.page} of {metaData.totalPages} ({metaData.totalCount} total)
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
              disabled={!metaData.hasPreviousPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!metaData.hasNextPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AssignLandlordModal
        isOpen={assignIds !== null}
        recordIds={assignIds ?? []}
        onClose={() => setAssignIds(null)}
      />

      <EditIngestRecordModal
        isOpen={editing !== null}
        record={editing}
        onClose={() => setEditing(null)}
      />

      {deleting && (
        <Modal
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          showCloseButton={false}
          isFullscreen={false}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete this record?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This permanently removes{" "}
              <span className="font-medium">{deleting.address1 || deleting.url}</span>{" "}
              from the ingest table. It does not affect any published listing.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={deleteRecord.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteRecord.isPending}
              >
                {deleteRecord.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        showCloseButton={false}
        isFullscreen={false}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Clear all ingest data?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This permanently removes every scraped record, the draft listings
            created from them, and the import history. Listings created by hand
            — and the landlord accounts themselves — are kept.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Re-import the scraped file afterwards to start fresh.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmClear(false)}
              disabled={clearIngest.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={clearIngest.isPending}
            >
              {clearIngest.isPending ? "Clearing…" : "Clear all"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IngestRecordsList;