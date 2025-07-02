"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import { useJobApplicationsLogic } from '@/services/hooks/useJobApplicationsLogic';
import { JobApplicationsProps } from '@/services/types/JobApplicationsTypes';
import {
  JobApplicationsHeader,
  JobApplicationsFilters,
  JobApplicationsTable,
  JobApplicationsTablePagination,
} from './components';

const JobApplications: React.FC<JobApplicationsProps> = ({ className = "" }) => {
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
    isViewingResume,
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobApplication,
    clearAllFilters,
    hasActiveFilters,
  } = useJobApplicationsLogic();

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading job applications: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <JobApplicationsHeader
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
      />

      <JobApplicationsFilters
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={filterChange}
        stateOptions={stateOptions}
        statusOptions={statusOptions}
        itemsPerPageOptions={itemsPerPageOptions}
      />

      <JobApplicationsTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onViewJobApplication={viewJobApplication}
        onViewResume={initViewResume}
        isViewingResume={isViewingResume}
      />

      <JobApplicationsTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
      />      
      
      <FullScreenSpinner 
        isVisible={isViewingResume} 
        message="Opening resume..." 
      />
    </div>
  );
};

export default JobApplications;