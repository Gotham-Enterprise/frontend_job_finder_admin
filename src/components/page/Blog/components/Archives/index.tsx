"use client"

import React from 'react';
import { useArchivedBlogLogic } from '@/services/hooks/useArchivedBlogLogic';
import ArchiveHeader from './ArchiveHeader';
import ArchiveFilters from './ArchiveFilters';
import ArchiveTable from './ArchiveTable';
import PaginationComponent from '../../../../tables/Pagination';

export default function ArchiveBlog() {
  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedPosts,
    data,
    isLoading,
    error,
    refetch,
    isRestoring,
    tableColumns,
    statusOptions,
    sortOptions,
    categoryOptions,
    tagOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    getStatusVariant,
    selectPost,
    selectAll,
    editPost,
    previewPost,
    bulkRestorePosts,
    clearSelectedPosts,
    hasActiveFilters,
    clearIndividualFilter,
    clearAllFilters,
  } = useArchivedBlogLogic();

  const clearFilters = () => {
    clearAllFilters();
  };

  const filterDropdownContent = (
    <ArchiveFilters
      filters={filters}
      onFilterChange={filterChange}
      categoryOptions={categoryOptions}
      tagOptions={tagOptions}
      statusOptions={statusOptions}
      hasActiveFilters={hasActiveFilters}
      clearIndividualFilter={clearIndividualFilter}
    />
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load archived blog posts
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <ArchiveHeader
        totalCount={data?.metaData?.totalCount}
        isPending={isPending}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        onRefetch={refetch}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filterDropdownContent={filterDropdownContent}
        selectedPosts={selectedPosts}
        onBulkRestore={bulkRestorePosts}
        onClearSelection={clearSelectedPosts}
        isRestoring={isRestoring}
      />

      <ArchiveTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onEditPost={editPost}
        onPreviewPost={previewPost}
        selectedPosts={selectedPosts}
        onSelectPost={selectPost}
        onSelectAll={selectAll}
      />

      {data?.metaData && data.metaData.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <PaginationComponent
            currentPage={filters.page || 1}
            totalPages={data.metaData.totalPages}
            onPageChange={initPageChange}
          />
        </div>
      )}
    </div>
  );
}
