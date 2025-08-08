import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from '@/services/utils/toast';

import { IdApproval, IdApprovalFilters, IdApprovalStatusUpdate, UseIdApprovalLogic } from "../types/idApproval";
import { useGetIdApprovals, useIdApprovalUpdateStatus } from "./useIdApproval";

export const useIdApprovalLogic = (): UseIdApprovalLogic => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): IdApprovalFilters => {
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const status = searchParams.get('status') || '';

    return { search, limit, page, status };
  }

  const initialFilters = getInitialFilters();

  /** states */
  const [filters, setFilters] = useState<IdApprovalFilters>(initialFilters);
  const [selected, setSelected] = useState<IdApproval | null>(null);

  /** queries/mutations */
  const { data: idApprovals, isFetching: isLoading, refetch } = useGetIdApprovals(filters);
  const data = idApprovals?.data || [];
  const totalCount = idApprovals?.metaData.totalCount || 0;
  const metaData = idApprovals?.metaData || {
    page: 1,
    limit: 50,
    totalPages: 1,
    totalCount: 0,
    currentPageTotalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const { mutate, isPending: isUpdating } = useIdApprovalUpdateStatus();

  /** useEffects */
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', encodeURIComponent(filters.search));
    if (filters.status) params.set('status', filters.status);
    
    const nextUrl = params.toString() ? `?${params.toString()}` : '';
    const url = window.location.search;

  
    if (nextUrl !== url) {
      router.replace(`/admin/unlock-request${nextUrl}`, { scroll: false });

      refetch()
    }
  }, [filters, router, refetch]);

  /** memos */
  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'accountStatus', label: 'Account Status' },
    { key: 'status', label: 'ID Status' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ], []);
  const itemsPerPageOptions = useMemo(() => [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
  ], []);

  /** callbacks */
  const onFilterChange = useCallback((key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const onUpdateStatus = useCallback((id: IdApprovalStatusUpdate['id'], status: IdApprovalStatusUpdate['status']) => {
    mutate({ id, status }, {
      onSuccess: (data) => {
        setSelected(null);
        refetch();

        const title = status === 'approved' ? 'Unlock Request Approved' : 'Unlock Request Declined';

        showToast.success(title, data.message);
      },
    });
  }, [mutate, refetch, setSelected]);

  return {
    data,
    isLoading,
    totalCount,
    metaData,
    tableColumns,
    filters,
    itemsPerPageOptions,
    selected,
    isUpdating,
    onFilterChange,
    setSelected,
    onUpdateStatus,
  };
}