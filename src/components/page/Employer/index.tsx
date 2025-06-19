"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import FullScreenSpinner from '../../ui/FullScreenSpinner';
import { useEmployerLogic } from '@/services/hooks/useEmployerLogic';
import {
  EmployerHeader,
  EmployerFilters,
  EmployerTable,
  EmployerTablePagination,
} from './components';
import { EmployersProps } from '@/services/types/EmployerTypes';

const Employers: React.FC<EmployersProps> = ({ className = "" }) => {  const {

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
    initPageChange,
    getStatusVariant,
    viewEmployer,
    viewSubscription,
      selectedEmployerId,
    employerSelect,
    onCreateJob,
    isCreatingJob,
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
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>      <EmployerHeader
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
      />

      <EmployerFilters
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={filterChange}
        stateOptions={stateOptions}
        statusOptions={statusOptions}
        itemsPerPageOptions={itemsPerPageOptions}
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
      />     
      
       <EmployerTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
      />
      
      <FullScreenSpinner 
        isVisible={isCreatingJob} 
        message="Preparing job creation..." 
      />
    </div>
  );
};

export default Employers;