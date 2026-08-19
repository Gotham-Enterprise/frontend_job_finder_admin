"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorState from "../../common/ErrorState";
import { BoltIcon } from "@/icons";
import FullScreenSpinner from "../../ui/FullScreenSpinner";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useMedicalLibraryLogic } from "@/services/hooks/useMedicalLibraryLogic";
import { MedicalLibraryHeader, MedicalLibraryTable, MedicalLibraryTablePagination } from "./components";

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
    tableColumns,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    handleDelete,
    confirmation,
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

  const isMutating = isCreating || isUpdating || isDeleting;

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
        />

        <MedicalLibraryTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onEditTopic={(topic) => router.push(`/admin/medical-library/edit/${topic.id}`)}
          onDeleteTopic={handleDelete}
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
        message={isDeleting ? "Deleting topic..." : isUpdating ? "Updating topic..." : "Creating topic..."}
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
