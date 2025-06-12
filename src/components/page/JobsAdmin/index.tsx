"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useJobsAdminLogic } from '@/services/hooks/useJobsAdminLogic';
import { JobsAdminProps } from '@/services/types/JobsAdminTypes';
import {
  JobsAdminHeader,
  JobsAdminFilters,
  JobsAdminTable,
  JobsAdminTablePagination,
} from './components';

const JobsAdmin: React.FC<JobsAdminProps> = ({ className = "" }) => {
  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedOccupationId,
    
    data,
    isLoading,
    error,
    refetch,
    
    tableColumns,
    jobStatusOptions,
    occupationOptions,
    specialtyOptions,
    stateOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    getStatusVariant,
    getJobStatusVariant,
    viewJobDetails,
  } = useJobsAdminLogic();

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading jobs: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <JobsAdminHeader
        totalCount={data?.metaData?.totalCount || 0}
        isPending={isPending}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        onRefetch={refetch}
      />

      <JobsAdminFilters
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={filterChange}
        occupationOptions={occupationOptions}
        specialtyOptions={specialtyOptions}
        stateOptions={stateOptions}
        jobStatusOptions={jobStatusOptions}
        itemsPerPageOptions={itemsPerPageOptions}
        selectedOccupationId={selectedOccupationId}
      />

      <JobsAdminTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        getJobStatusVariant={getJobStatusVariant}
        onViewJobDetails={viewJobDetails}
      />

      <JobsAdminTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
      />
    </div>
  );
};

export default JobsAdmin;
