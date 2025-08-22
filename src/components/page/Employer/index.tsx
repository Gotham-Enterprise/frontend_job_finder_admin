"use client";
import React, { useEffect } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import { useEmployerLogic } from '@/services/hooks/useEmployerLogic';
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
import {
  EmployerHeader,
  EmployerFilters,
  EmployerTable,
  EmployerTablePagination,
} from './components';
import { EmployersProps } from '@/services/types/EmployerTypes';

const Employers: React.FC<EmployersProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: 'employer-search-state',
    scrollPath: 'employer-scroll-position',
    listPagePath: '/admin/employers'
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
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,
    filterChange,
    statusToggle,
    selectedStatuses,
    initPageChange,
    getStatusVariant,
    viewEmployer,
    viewSubscription,
      selectedEmployerId,
    employerSelect,
    onCreateJob,
    isCreatingJob,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  } = useEmployerLogic();

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading employers: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  const filterContent = (
    <EmployerFilters
      isOpen={true}
      filters={filters}
      onFilterChange={filterChange}
      stateOptions={stateOptions}
      statusOptions={statusOptions}
      selectedStatuses={selectedStatuses}
      onStatusToggle={statusToggle}
      hasActiveFilters={hasActiveFilters}
      clearIndividualFilter={clearIndividualFilter}
    />
  );

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <EmployerHeader
        totalCount={data?.metaData?.totalCount || 0}
        isPending={isPending}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        onRefetch={refetch}
        selectedEmployerId={selectedEmployerId}
        onCreateJob={onCreateJob}
        isCreatingJob={isCreatingJob}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        filterContent={filterContent}
      />
      
      <EmployerTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusVariant={getStatusVariant}
        onViewEmployer={viewEmployer}
        onViewSubscription={viewSubscription}
        selectedEmployerId={selectedEmployerId}
        onEmployerSelect={employerSelect}
        onRefresh={refetch}
      />     
      
       <EmployerTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />
      
      <FullScreenSpinner 
        isVisible={isCreatingJob} 
        message="Preparing job creation..." 
      />
    </div>
  );
};

export default Employers;