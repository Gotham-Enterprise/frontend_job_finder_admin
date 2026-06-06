"use client";
import React from "react";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";
import ConfirmationDialog from "../../ui/ConfirmationDialog";
import { useSupervisionReviewsLogic } from "@/services/hooks/useSupervisionReviewsLogic";
import {
  ReviewHeader,
  ReviewFilters,
  ReviewTable,
  ReviewTablePagination,
} from "./components";

const SupervisionReviews: React.FC = () => {
  const {
    filters,
    searchInput,
    setSearchInput,
    applyKeywordSearch,
    isFilterOpen,
    setIsFilterOpen,
    isPending,

    data,
    isLoading,
    error,
    refetch,

    tableColumns,
    ratingOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    viewReview,

    deleteConfirmReviewId,
    deleteConfirmComment,
    isDeleting,
    openDeleteConfirm,
    cancelDelete,
    confirmDelete,
  } = useSupervisionReviewsLogic();

  if (error && !isPending) {
    return (
      <ErrorState
        message={`Error loading reviews: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ReviewHeader
          totalCount={data?.metaData?.totalCount || 0}
          isPending={isPending}
          isLoading={isLoading}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          applyKeywordSearch={applyKeywordSearch}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onRefetch={refetch}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          filterDropdownContent={
            <ReviewFilters
              filters={filters}
              onFilterChange={filterChange}
              ratingOptions={ratingOptions}
              hasActiveFilters={hasActiveFilters}
              clearIndividualFilter={clearIndividualFilter}
            />
          }
        />

        <ReviewTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onViewReview={viewReview}
          onDeleteReview={openDeleteConfirm}
        />

        <ReviewTablePagination
          data={data}
          filters={filters}
          onPageChange={initPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          onFilterChange={filterChange}
        />
      </div>

      <ConfirmationDialog
        isOpen={!!deleteConfirmReviewId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Review"
        message={`Are you sure you want to permanently delete this review? "${deleteConfirmComment}" This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
};

export default SupervisionReviews;
