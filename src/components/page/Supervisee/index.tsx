"use client";

import React from "react";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";
import { useSuperviseeLogic } from "@/services/hooks/useSuperviseeLogic";
import { usePreservedNavigation } from "@/hooks/usePreservedNavigation";
import { SuperviseesProps } from "@/services/types/SuperviseeTypes";
import {
  SuperviseeHeader,
  SuperviseeTable,
  SuperviseeTablePagination,
  EditSuperviseeModal,
  ResendVerificationModal,
} from "./components";

const Supervisees: React.FC<SuperviseesProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: "supervisee-search-state",
    scrollPath: "supervisee-scroll-position",
    listPagePath: "/admin/supervisees",
  });

  const {
    filters,
    searchInput,
    setSearchInput,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    tableColumns,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    viewSupervisee,
    editModal,
    openEditModal,
    closeEditModal,

    resendModal,
    isResending,
    openResendModal,
    closeResendModal,
    confirmResend,
  } = useSuperviseeLogic();

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading supervisees: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        <SuperviseeHeader
          totalCount={data?.metaData?.totalCount || 0}
          isPending={isPending}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />

        <SuperviseeTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onViewSupervisee={viewSupervisee}
          onEditSupervisee={openEditModal}
          onResendVerification={openResendModal}
        />

        <SuperviseeTablePagination
          data={data}
          filters={filters}
          onPageChange={initPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          onFilterChange={filterChange}
        />
      </div>

      <EditSuperviseeModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        superviseeId={editModal.superviseeId}
        superviseeName={editModal.fullName}
        onUpdate={() => refetch()}
      />

      <ResendVerificationModal
        isOpen={resendModal.isOpen}
        fullName={resendModal.fullName}
        onConfirm={confirmResend}
        onCancel={closeResendModal}
        isLoading={isResending}
      />
    </>
  );
};

export default Supervisees;
