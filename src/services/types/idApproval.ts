import { Dispatch, SetStateAction } from "react";

export interface UseIdApprovalLogic {
  data: IdApproval[];
  isLoading: boolean;
  totalCount: number;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  tableColumns: { key: string; label: string; className?: string }[];
}

export interface IdApproval {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
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
}