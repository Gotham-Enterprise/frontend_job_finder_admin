"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useJobSeekersLogic } from '@/services/hooks/useJobSeekersLogic';
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
import { JobSeekersProps } from '@/services/types/JobSeekersTypes';
import {
  JobSeekersHeader,
  JobSeekersFilters,
  JobSeekersTable,
  JobSeekersTablePagination,
} from './components';

const JobSeekers: React.FC<JobSeekersProps> = ({ className = "" }) => {
  const { saveNavigationState, clearNavigationState } = usePreservedNavigation({
    enabled: true,
    statePath: 'jobseeker-search-state',
    scrollPath: 'jobseeker-scroll-position',
    listPagePath: '/admin/job-seekers',
  });

  const {
    filters,
    searchInput,
    setSearchInput,
    selectedStatuses,
    setSelectedStatuses,
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
    occupationOptions,
    stateOptions,
    itemsPerPageOptions,
    filterChange,
    statusToggleChange,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobSeeker,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  } = useJobSeekersLogic();

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading job seekers: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <JobSeekersHeader
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
          <JobSeekersFilters
            filters={filters}
            onFilterChange={filterChange}
            occupationOptions={occupationOptions}
            stateOptions={stateOptions}
            statusOptions={statusOptions}
            selectedStatuses={selectedStatuses}
            onStatusToggleChange={statusToggleChange}
            hasActiveFilters={hasActiveFilters}
            clearIndividualFilter={clearIndividualFilter}
          />
        }
      />

      <JobSeekersTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onViewJobSeeker={viewJobSeeker}
        onViewResume={initViewResume}
        isViewingResume={isViewingResume}
      />

      <JobSeekersTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />
    </div>
  );
};

export default JobSeekers;