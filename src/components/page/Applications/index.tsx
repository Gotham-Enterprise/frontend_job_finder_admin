"use client";
import React, { useEffect } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import { useJobApplicationsLogic } from '@/services/hooks/useJobApplicationsLogic';
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
import { JobApplicationsProps } from '@/services/types/JobApplicationsTypes';
import {
  JobApplicationsHeader,
  JobApplicationsFilters,
  JobApplicationsTable,
  JobApplicationsTablePagination,
} from './components';

const JobApplications: React.FC<JobApplicationsProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: 'jobApplications-search-state',
    scrollPath: 'jobApplications-scroll-position',
    listPagePath: '/admin/applications'
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
    isViewingResume,
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,
    filterChange,
    handleStatusToggle,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobApplication,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    selectedStatuses,
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
        filterContent={
          <JobApplicationsFilters
            isOpen={isFilterOpen}
            filters={filters}
            onFilterChange={filterChange}
            stateOptions={stateOptions}
            statusOptions={statusOptions}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            hasActiveFilters={hasActiveFilters}
            clearIndividualFilter={clearIndividualFilter}
          />
        }
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
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />      
      
      <FullScreenSpinner 
        isVisible={isViewingResume} 
        message="Opening resume..." 
      />
    </div>
  );
};

export default JobApplications;