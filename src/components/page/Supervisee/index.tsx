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

const Supervisees: React.FC<SuperviseesProps> = ({ className = "", variant = "supervisees" }) => {
  const {
    labels,
    basePath,
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
  } = useSuperviseeLogic(variant);

  usePreservedNavigation({
    statePath: `${variant === "preceptees" ? "preceptee" : "supervisee"}-search-state`,
    scrollPath: `${variant === "preceptees" ? "preceptee" : "supervisee"}-scroll-position`,
    listPagePath: basePath,
  });

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading ${labels.pluralLower}: ${error.message}`}
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
          labels={labels}
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
          labels={labels}
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
