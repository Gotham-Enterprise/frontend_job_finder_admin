import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from "react";

import { IdApprovalFilters, UseIdApprovalLogic } from "../types/idApproval";
import { useGetIdApprovals } from "./useIdApproval";

export const useIdApprovalLogic = (): UseIdApprovalLogic => {
  const searchParams = useSearchParams();

  const getInitialFilters = (): IdApprovalFilters => {
    const search = searchParams.get('search') || '';

    return { search };
  }

  const initialFilters = getInitialFilters();
  const [searchTerm, setSearchTerm] = useState<string>(() => initialFilters.search || '');

  const { data: idApprovals, isFetching: isLoading, } = useGetIdApprovals();
  const data = idApprovals?.data || [];
  const totalCount = idApprovals?.metaData.totalCount || 0;

  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'accountStatus', label: 'Account Status' },
    { key: 'status', label: 'ID Status' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ], []);

  return { data, isLoading, totalCount, searchTerm, setSearchTerm, tableColumns };
}