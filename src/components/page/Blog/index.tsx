"use client";
import React, { useEffect } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useBlogLogic } from '@/services/hooks/useBlogLogic';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';
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
  const { permissions } = useAuthPermissions();
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
    isDeleting,
    isBulkDeleting,
    isUpdatingStatus,
    
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
    deletePost,
    bulkDeletePosts,
    bulkPublishPosts,
    bulkDraftPosts,
    clearSelectedPosts,
    hasActiveFilters,
    clearIndividualFilter,
    clearAllFilters,
    confirmation,
  } = useBlogLogic();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

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
        onBulkPublish={bulkPublishPosts}
        onBulkDraft={bulkDraftPosts}
        onClearSelection={clearSelectedPosts}
        isBulkDeleting={isBulkDeleting}
        isUpdatingStatus={isUpdatingStatus}
        blogPermissions={permissions?.blog}
        filterDropdownContent={
          <BlogFilters
            filters={filters}
            onFilterChange={filterChange}
            categoryOptions={categoryOptions}
            tagOptions={tagOptions}
            statusOptions={statusOptions}
            sortOptions={sortOptions}
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
        onPreviewPost={previewPost}
        onDeletePost={deletePost}
        selectedPosts={selectedPosts}
        onSelectPost={selectPost}
        onSelectAll={selectAll}
      />

      <BlogTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />
      
      <FullScreenSpinner 
        isVisible={isDeleting || isBulkDeleting || isUpdatingStatus} 
        message={
          isUpdatingStatus ? 'Updating post status...' :
          isBulkDeleting ? 'Deleting posts...' : 
          'Deleting post...'
        } 
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
        isLoading={isDeleting || isBulkDeleting || isUpdatingStatus}
      />
    </div>
  );
};

export default AllBlogPosts;