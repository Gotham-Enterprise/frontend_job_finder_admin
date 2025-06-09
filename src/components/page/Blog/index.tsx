"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
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
    viewPost,
    editPost,
    deletePost,
    bulkDeletePosts,
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
      />

      <BlogFilters
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={filterChange}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
        itemsPerPageOptions={itemsPerPageOptions}
      />

      <BlogTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onViewPost={viewPost}
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
        selectedPosts={selectedPosts}
        onBulkDelete={bulkDeletePosts}
        isBulkDeleting={isBulkDeleting}
      />
      
      <FullScreenSpinner 
        isVisible={isDeleting || isBulkDeleting} 
        message={isBulkDeleting ? 'Deleting posts...' : 'Deleting post...'} 
      />
    </div>
  );
};

export default AllBlogPosts;