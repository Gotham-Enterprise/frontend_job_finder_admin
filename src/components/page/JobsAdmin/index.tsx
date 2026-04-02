"use client";
import React, { useEffect } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useJobsAdminLogic } from '@/services/hooks/useJobsAdminLogic';
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
import { JobsAdminProps } from '@/services/types/JobsAdminTypes';
import {
  JobsAdminHeader,
  JobsAdminFilters,
  JobsAdminTable,
  JobsAdminTablePagination,
} from './components';

const JobsAdmin: React.FC<JobsAdminProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: 'jobsAdmin-search-state',
    scrollPath: 'jobsAdmin-scroll-position',
    listPagePath: '/admin/jobs'
  });
  
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
    cityOptions,
    isLoadingCities,
    itemsPerPageOptions,    
    filterChange,
    jobStatusToggle,
    initPageChange,
    getStatusVariant,
    getJobStatusVariant,
    viewJobDetails,
    editJobPost,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    selectedJobStatuses,
    companyNameInput,
    setCompanyNameInput,
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
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        filterDropdownContent={
          <JobsAdminFilters
            filters={filters}
            onFilterChange={filterChange}
            onClearIndividualFilter={clearIndividualFilter}
            occupationOptions={occupationOptions}
            specialtyOptions={specialtyOptions}
            stateOptions={stateOptions}
            cityOptions={cityOptions}
            isLoadingCities={isLoadingCities}
            jobStatusOptions={jobStatusOptions}
            selectedOccupationId={selectedOccupationId}
            hasActiveFilters={hasActiveFilters}
            selectedJobStatuses={selectedJobStatuses}
            onJobStatusToggle={jobStatusToggle}            companyNameInput={companyNameInput}
            setCompanyNameInput={setCompanyNameInput}          />
        }
      />

      <JobsAdminTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        getJobStatusVariant={getJobStatusVariant}
        onViewJobDetails={viewJobDetails}
        onEditJobPost={editJobPost}
      />

      <JobsAdminTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />
    </div>
  );
};

export default JobsAdmin;
