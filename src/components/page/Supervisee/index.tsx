"use client";

import React from "react";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";
import { useSuperviseeLogic } from "@/services/hooks/useSuperviseeLogic";
import { usePreservedNavigation } from "@/hooks/usePreservedNavigation";
import { SuperviseesProps } from "@/services/types/SuperviseeTypes";
import {
  SuperviseeHeader,
  SuperviseeFilters,
  SuperviseeTable,
  SuperviseeTablePagination,
  EditSuperviseeModal,
  ResendVerificationModal,
  ApproveEmailVerificationModal,
  HideProfileModal,
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
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    tableColumns,
    itemsPerPageOptions,
    sortBy,
    sortOrder,
    handleSort,
    filterChange,
    initPageChange,
    viewSupervisee,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    editModal,
    openEditModal,
    closeEditModal,

    resendModal,
    isResending,
    openResendModal,
    closeResendModal,
    confirmResend,

    approveEmailModal,
    isApprovingEmail,
    openApproveEmailModal,
    closeApproveEmailModal,
    confirmApproveEmail,

    hideProfileModal,
    isHidingProfile,
    openHideProfileModal,
    closeHideProfileModal,
    confirmHideProfile,
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
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          filterDropdownContent={
            <SuperviseeFilters
              filters={filters}
              onFilterChange={filterChange}
              clearIndividualFilter={clearIndividualFilter}
            />
          }
        />

        <SuperviseeTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewSupervisee={viewSupervisee}
          onEditSupervisee={openEditModal}
          onResendVerification={openResendModal}
          onApproveEmailVerification={openApproveEmailModal}
          onToggleHideProfile={openHideProfileModal}
          onRefresh={refetch}
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

      <ApproveEmailVerificationModal
        isOpen={approveEmailModal.isOpen}
        fullName={approveEmailModal.fullName}
        onConfirm={confirmApproveEmail}
        onCancel={closeApproveEmailModal}
        isLoading={isApprovingEmail}
      />

      <HideProfileModal
        isOpen={hideProfileModal.isOpen}
        fullName={hideProfileModal.fullName}
        currentlyHidden={hideProfileModal.currentlyHidden}
        onConfirm={confirmHideProfile}
        onCancel={closeHideProfileModal}
        isLoading={isHidingProfile}
      />
    </>
  );
};

export default Supervisees;
