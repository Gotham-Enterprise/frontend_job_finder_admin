"use client";
import React, { useState, useEffect } from 'react';
import {
  OccupationsHeader,
  OccupationsFilters,
  OccupationsTable,
  OccupationsTablePagination,
  CreateOccupationModal,
  EditOccupationModal,
  DeleteOccupationModal,
  ManageSpecializationsModal,
} from './components';
import { OccupationItem } from '@/services/types/occupation';
import {
  useOccupationsQuery,
  useCreateOccupation,
  useUpdateOccupation,
  useDeleteOccupation,
} from '@/services/hooks/useOccupations';

export default function OccupationsData() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 400ms debounce on search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Reset to page 1 whenever debounced search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState<OccupationItem | null>(null);
  const [managingOccupation, setManagingOccupation] = useState<OccupationItem | null>(null);
  const [deletingOccupation, setDeletingOccupation] = useState<OccupationItem | null>(null);

  // Queries - Server-side search & pagination
  const { data, isLoading, isFetching } = useOccupationsQuery({
    page,
    limit,
    sortBy,
    search: debouncedSearch,
    includeAll: true,
  });

  // Mutations
  const createMutation = useCreateOccupation();
  const updateMutation = useUpdateOccupation();
  const deleteMutation = useDeleteOccupation();

  const occupationsList = data?.data || [];
  const metaData = data?.metaData;

  const handleCreateOccupation = async (payload: { name: string }) => {
    await createMutation.mutateAsync(payload);
    setIsCreateOpen(false);
  };

    const handleUpdateOccupation = async (id: number, payload: { name: string; isDropdown?: boolean }) => {
      await updateMutation.mutateAsync({ id, payload });
      setEditingOccupation(null);
    };

    const handleRestoreOccupation = async (occupation: OccupationItem) => {
      try {
        await updateMutation.mutateAsync({
          id: occupation.id,
          payload: { isDropdown: true },
        });
      } catch {
        // Handled by onError toast in hook
      }
    };

    const handleDeleteOccupation = async () => {
      if (!deletingOccupation) return;
      try {
        await deleteMutation.mutateAsync(deletingOccupation.id);
        setDeletingOccupation(null);
      } catch {
        // Handled by onError toast in hook
      }
    };

    const handleClearFilters = () => {
      setSearchInput('');
      setDebouncedSearch('');
      setSortBy('name');
      setPage(1);
    };

    const hasActiveFilters = Boolean(searchInput || sortBy !== 'name');

    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <OccupationsHeader
          totalCount={metaData?.totalCount ?? occupationsList.length}
          isPending={isFetching}
          onCreateOccupation={() => setIsCreateOpen(true)}
        />

        {/* Filters */}
        <OccupationsFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          sortBy={sortBy}
          setSortBy={(val) => {
            setSortBy(val);
            setPage(1);
          }}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Table */}
        <OccupationsTable
          data={occupationsList}
          isLoading={isLoading}
          searchTerm={debouncedSearch}
          onClearSearch={() => {
            setSearchInput('');
            setDebouncedSearch('');
          }}
          onEdit={(item) => setEditingOccupation(item)}
          onDelete={(item) => setDeletingOccupation(item)}
          onRestore={handleRestoreOccupation}
          onManageSpecialties={(item) => setManagingOccupation(item)}
          onCreateNew={() => setIsCreateOpen(true)}
        />

        {/* Pagination */}
        <OccupationsTablePagination
          metaData={metaData}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />

        {/* Modals */}
        <CreateOccupationModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateOccupation}
          isLoading={createMutation.isPending}
        />

        <EditOccupationModal
          isOpen={Boolean(editingOccupation)}
          onClose={() => setEditingOccupation(null)}
          occupation={editingOccupation}
          onSubmit={handleUpdateOccupation}
          isLoading={updateMutation.isPending}
        />

        <DeleteOccupationModal
          isOpen={Boolean(deletingOccupation)}
          onClose={() => setDeletingOccupation(null)}
          occupation={deletingOccupation}
          onConfirm={handleDeleteOccupation}
          isLoading={deleteMutation.isPending}
        />

        <ManageSpecializationsModal
          isOpen={Boolean(managingOccupation)}
          onClose={() => setManagingOccupation(null)}
          occupation={managingOccupation}
        />
      </div>
    );
  }
