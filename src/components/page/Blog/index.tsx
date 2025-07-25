"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useBlogLogic } from '@/services/hooks/useBlogLogic';
import {
  BlogHeader,
  BlogFilters,
  BlogTable,
  BlogTablePagination,
} from './components';

interface AllBlogPostsProps {
  className?: string;
}

const AllBlogPosts: React.FC<AllBlogPostsProps> = ({ className = "" }) => {
  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedPosts,
    selectedStatuses,
    
    data,
    isLoading,
    error,
    refetch,
    isDeleting,
    isBulkDeleting,
    
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
    deletePost,
    bulkDeletePosts,
    clearSelectedPosts,
    hasActiveFilters,
    handleStatusToggle,
    clearIndividualFilter,
    clearAllFilters,
    
    // Confirmation dialog
    confirmation,
  } = useBlogLogic();

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading blog posts: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <BlogHeader
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
        selectedPosts={selectedPosts}
        onBulkDelete={bulkDeletePosts}
        onClearSelection={clearSelectedPosts}
        isBulkDeleting={isBulkDeleting}
        filterDropdownContent={
          <BlogFilters
            filters={filters}
            onFilterChange={filterChange}
            categoryOptions={categoryOptions}
            tagOptions={tagOptions}
            statusOptions={statusOptions}
            sortOptions={sortOptions}
            itemsPerPageOptions={itemsPerPageOptions}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            hasActiveFilters={hasActiveFilters}
            clearIndividualFilter={clearIndividualFilter}
          />
        }
      />

      <BlogTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onEditPost={editPost}
        onDeletePost={deletePost}
        selectedPosts={selectedPosts}
        onSelectPost={selectPost}
        onSelectAll={selectAll}
      />

      <BlogTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
      />
      
      <FullScreenSpinner 
        isVisible={isDeleting || isBulkDeleting} 
        message={isBulkDeleting ? 'Deleting posts...' : 'Deleting post...'} 
      />

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ''}
        message={confirmation.config?.message || ''}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={isDeleting || isBulkDeleting}
      />
    </div>
  );
};

export default AllBlogPosts;