"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useDeletedJobSeekersLogic } from '@/services/hooks/useDeletedJobSeekersLogic';
import { DeletedJobSeekersProps } from '@/services/types/deletedJobSeekers';
import { DeletedJobSeekerAccount } from '@/services/api/deletedJobSeekers';
import {
  DeletedJobSeekersHeader,
  DeletedJobSeekersFilters,
  DeletedJobSeekersTable,
  DeletedJobSeekersTablePagination,
  RestoreAccountModal,
  ViewDeletedDetailsModal,
} from './components';

const DeletedJobSeekers: React.FC<DeletedJobSeekersProps> = ({ className = "" }) => {
  const [selectedDeletedAccount, setSelectedDeletedAccount] = useState<DeletedJobSeekerAccount | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    isRestoring,
    
    data,
    isLoading,
    error,
    refetch,
    
    tableColumns,
    statusOptions,
    itemsPerPageOptions,
    
    filterChange,
    initPageChange,
    viewDeletedAccountDetails,
    restoreAccount,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  } = useDeletedJobSeekersLogic();

  const handleViewDetails = (deletedAccountId: string) => {
    const account = data?.data?.find(acc => acc.id === deletedAccountId);
    if (account) {
      setSelectedDeletedAccount(account);
      setIsDetailsModalOpen(true);
    }
  };

  const handleRestoreAccount = (deletedAccount: DeletedJobSeekerAccount) => {
    setSelectedDeletedAccount(deletedAccount);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreSubmit = async (deletedAccountId: string, adminPassword: string) => {
    try {
      await restoreAccount(deletedAccountId, adminPassword);
      setIsRestoreModalOpen(false);
      setSelectedDeletedAccount(null);
    } catch (error) {
      // Error handling is done in the hook
      throw error;
    }
  };

  const handleCloseRestoreModal = () => {
    setIsRestoreModalOpen(false);
    setSelectedDeletedAccount(null);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDeletedAccount(null);
  };

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading deleted job seekers: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <>
      <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
        <DeletedJobSeekersHeader
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

        {isFilterOpen && (
          <DeletedJobSeekersFilters
            filters={filters}
            onFilterChange={filterChange}
            hasActiveFilters={hasActiveFilters}
            clearIndividualFilter={clearIndividualFilter}
            adminUsers={[]} // You can populate this with admin users if needed
          />
        )}

        <DeletedJobSeekersTable
          data={data}
          isLoading={isLoading}
          tableColumns={tableColumns}
          onViewDetails={handleViewDetails}
          onRestoreAccount={handleRestoreAccount}
          onRefresh={refetch}
        />

        <DeletedJobSeekersTablePagination
          data={data}
          filters={filters}
          onPageChange={initPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          onFilterChange={filterChange}
        />
      </div>

      {/* Restore Account Modal */}
      <RestoreAccountModal
        isOpen={isRestoreModalOpen}
        onClose={handleCloseRestoreModal}
        deletedAccount={selectedDeletedAccount}
        onRestore={handleRestoreSubmit}
        isRestoring={isRestoring}
      />

      {/* View Details Modal */}
      <ViewDeletedDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        deletedAccount={selectedDeletedAccount}
        onRestore={handleRestoreAccount}
        isLoading={false}
      />
    </>
  );
};

export default DeletedJobSeekers;
