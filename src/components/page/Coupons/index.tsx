"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useCouponsLogic } from '@/services/hooks/useCouponsLogic';
import { useCreateCoupon, useDeleteCoupon } from '@/services/hooks/useCoupons';
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { CouponsProps, CreateCouponFormData } from '@/services/types/CouponsTypes';
import {
  CouponsHeader,
  CouponsFilters,
  CouponsTable,
  CouponsTablePagination,
  CreateCouponModal,
} from './components';

const CouponsData: React.FC<CouponsProps> = ({ className = "" }) => {
  usePreservedNavigation({
    statePath: 'coupons-search-state',
    scrollPath: 'coupons-scroll-position',
    listPagePath: '/admin/coupons'
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const confirmation = useConfirmation();

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
    itemsPerPageOptions,

    filterChange,
    initPageChange,
    viewCoupon,
    clearAllFilters,
    hasActiveFilters,
    selectedStatuses,
    handleStatusToggle,
  } = useCouponsLogic();

  const createCouponMutation = useCreateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const deleteCoupon = async (couponId: string) => {
    const coupon = data?.data?.find((item: { id: string; title?: string }) => item.id === couponId);
    const confirmed = await confirmation.confirm({
      title: 'Delete coupon',
      message: `Remove "${coupon?.title || 'this coupon'}" from Stripe? The coupon will stay in this list as Deleted and can no longer be redeemed.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      await deleteCouponMutation.mutateAsync(couponId);
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
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
        filterContent={
          <CouponsFilters
            isOpen={isFilterOpen}
            filters={filters}
            onFilterChange={filterChange}
            statusOptions={statusOptions}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            hasActiveFilters={hasActiveFilters}
          />
        }
      />

      <CouponsTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        onViewCoupon={viewCoupon}
        onDeleteCoupon={deleteCoupon}
        isDeleting={deleteCouponMutation.isPending}
      />

      <CouponsTablePagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />

      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={submitCreateCoupon}
        isLoading={createCouponMutation.isPending}
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
        isLoading={deleteCouponMutation.isPending}
      />
    </div>
  );
};

export default CouponsData;