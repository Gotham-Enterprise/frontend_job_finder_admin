import { Dispatch, SetStateAction } from "react";

export interface UseIdApprovalLogic {
  data: IdApproval[];
  isLoading: boolean;
  totalCount: number;
  selected: IdApproval | null;
  tableColumns: { key: string; label: string; className?: string }[];
  metaData: IdApprovals['metaData'];
  filters: IdApprovalFilters;
  itemsPerPageOptions: { value: string; label: string }[];
  setSelected: Dispatch<SetStateAction<IdApproval | null>>;
  onFilterChange: (key: string, value: string | number) => void;
}

export interface IdApproval {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'declined';
  front: string;
  back: string;
  isLocked: boolean;
  fullName: string;
  email: string;
}

export interface IdApprovals {
  success: boolean;
  data: IdApproval[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface IdApprovalFilters {
  search?: string;
  limit: number;
  page: number;
  status?: string;
}