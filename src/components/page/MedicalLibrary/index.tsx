"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorState from "../../common/ErrorState";
import { BoltIcon } from "@/icons";
import FullScreenSpinner from "../../ui/FullScreenSpinner";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useMedicalLibraryLogic } from "@/services/hooks/useMedicalLibraryLogic";
import {
  MedicalLibraryHeader,
  MedicalLibraryTable,
  MedicalLibraryTablePagination,
  MedicalLibraryBulkBar,
} from "./components";

const MedicalLibraryPage: React.FC<{ className?: string }> = ({ className = "" }) => {
  const router = useRouter();

  const {
    filters,
    searchInput,
    setSearchInput,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkUpdating,
    tableColumns,
    itemsPerPageOptions,
    categoryOptions,
    statusOptions,
    sourceOptions,
    filterChange,
    initPageChange,
    handleDelete,
    confirmation,
    selectedIds,
    allOnPageSelected,
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
    handleBulkStatus,
  } = useMedicalLibraryLogic();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handleFocus = () => refetch();
    const handleVisibilityChange = () => {
      if (!document.hidden) refetch();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading medical library: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  const isMutating = isCreating || isUpdating || isDeleting || isBulkUpdating;

  return (
    <>
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        <MedicalLibraryHeader
          totalCount={data?.metaData?.totalCount || 0}
          isPending={isPending}
          isLoading={isLoading}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onRefetch={refetch}
          onAddNew={() => router.push("/admin/medical-library/add-new")}
          filters={filters}
          onFilterChange={filterChange}
          categoryOptions={categoryOptions}
          statusOptions={statusOptions}
          sourceOptions={sourceOptions}
        />

        <MedicalLibraryBulkBar
          selectedCount={selectedIds.length}
          isBusy={isMutating}
          onClearSelection={clearSelection}
          onBulkStatus={handleBulkStatus}
        />

        <MedicalLibraryTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onEditTopic={(topic) => router.push(`/admin/medical-library/edit/${topic.id}`)}
          onDeleteTopic={handleDelete}
          selectedIds={selectedIds}
          allOnPageSelected={allOnPageSelected}
          onToggleSelect={toggleSelect}
          onToggleSelectAllOnPage={toggleSelectAllOnPage}
        />

        <MedicalLibraryTablePagination
          data={data}
          filters={filters}
          onPageChange={initPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          onFilterChange={filterChange}
        />
      </div>

      <FullScreenSpinner
        isVisible={isMutating}
        message={
          isBulkUpdating
            ? "Updating topics..."
            : isDeleting
              ? "Deleting topic..."
              : isUpdating
                ? "Updating topic..."
                : "Creating topic..."
        }
      />

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ""}
        message={confirmation.config?.message || ""}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={isMutating}
      />
    </>
  );
};

export default MedicalLibraryPage;
