"use client";
import React from "react";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";
import { useSupervisorLogic } from "@/services/hooks/useSupervisorLogic";
import { usePreservedNavigation } from "@/hooks/usePreservedNavigation";
import { SupervisorsProps } from "@/services/types/SupervisorTypes";
import {
  SupervisorHeader,
  SupervisorFilters,
  SupervisorTable,
  SupervisorTablePagination,
  RejectSupervisorModal,
  ApproveSupervisorModal,
} from "./components";

const Supervisors: React.FC<SupervisorsProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: "supervisor-search-state",
    scrollPath: "supervisor-scroll-position",
    listPagePath: "/admin/supervisors",
  });

  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,

    data,
    isLoading,
    error,
    refetch,

    tableColumns,
    statusOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    viewSupervisor,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,

    approveModal,
    rejectModal,
    rejectNotes,
    setRejectNotes,
    approveNotes,
    setApproveNotes,
    isApproving,
    isRejecting,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    confirmApprove,
    confirmReject,
  } = useSupervisorLogic();

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading supervisors: ${error.message}`}
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
        <SupervisorHeader
          totalCount={data?.metaData?.totalCount || 0}
          isPending={isPending}
          isLoading={isLoading}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onRefetch={refetch}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          filterDropdownContent={
            <SupervisorFilters
              filters={filters}
              onFilterChange={filterChange}
              statusOptions={statusOptions}
              hasActiveFilters={hasActiveFilters}
              clearIndividualFilter={clearIndividualFilter}
            />
          }
        />

        <SupervisorTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onViewSupervisor={viewSupervisor}
          onApproveSupervisor={openApproveModal}
          onRejectSupervisor={openRejectModal}
          onRefresh={refetch}
        />

        <SupervisorTablePagination
          data={data}
          filters={filters}
          onPageChange={initPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          onFilterChange={filterChange}
        />
      </div>

      <ApproveSupervisorModal
        isOpen={approveModal.isOpen}
        fullName={approveModal.fullName}
        note={approveNotes}
        onNoteChange={setApproveNotes}
        onConfirm={confirmApprove}
        onCancel={closeApproveModal}
        isLoading={isApproving}
      />

      <RejectSupervisorModal
        isOpen={rejectModal.isOpen}
        fullName={rejectModal.fullName}
        notes={rejectNotes}
        onNotesChange={setRejectNotes}
        onConfirm={confirmReject}
        onCancel={closeRejectModal}
        isLoading={isRejecting}
      />
    </>
  );
};

export default Supervisors;
