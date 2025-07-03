"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useCouponsLogic } from '@/services/hooks/useCouponsLogic';
import { useCreateCoupon } from '@/services/hooks/useCoupons';
import { CouponsProps, CreateCouponFormData } from '@/services/types/CouponsTypes';
import {
  CouponsHeader,
  CouponsFilters,
  CouponsTable,
  CouponsTablePagination,
  CreateCouponModal,
} from './components';

const CouponsData: React.FC<CouponsProps> = ({ className = "" }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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
    sortByOptions,
    sortOrderOptions,
    itemsPerPageOptions,
    
    filterChange,
    initPageChange,
    viewCoupon,
    clearAllFilters,
    hasActiveFilters,
  } = useCouponsLogic();

  const createCouponMutation = useCreateCoupon();

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const submitCreateCoupon = async (formData: CreateCouponFormData) => {
    try {
      await createCouponMutation.mutateAsync(formData);
      closeCreateModal();
    } catch (error) {
      console.error('Failed to create coupon:', error);
    }
  };

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading coupons: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <CouponsHeader
        totalCount={data?.metaData?.totalCount || 0}
        isPending={isPending}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        onCreateCoupon={openCreateModal}
      />

      <CouponsFilters
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={filterChange}
        statusOptions={statusOptions}
        sortByOptions={sortByOptions}
        sortOrderOptions={sortOrderOptions}
        itemsPerPageOptions={itemsPerPageOptions}
      />

      <CouponsTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        onViewCoupon={viewCoupon}
      />

      <CouponsTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
      />

      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={submitCreateCoupon}
        isLoading={createCouponMutation.isPending}
      />
    </div>
  );
};

export default CouponsData;