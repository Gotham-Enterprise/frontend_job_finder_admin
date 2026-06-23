import { SuperviseeFilters, SuperviseesResponse } from "@/services/types/supervisee";

export interface SuperviseesProps {
  className?: string;
}

export interface SuperviseeHeaderProps {
  totalCount: number;
  isPending: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export interface SuperviseeTableProps {
  data: SuperviseesResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  onViewSupervisee: (superviseeId: string) => void;
  onEditSupervisee: (superviseeId: string, fullName: string) => void;
  onResendVerification: (superviseeId: string, fullName: string) => void;
}

export interface SuperviseeTablePaginationProps {
  data: SuperviseesResponse | undefined;
  filters: SuperviseeFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof SuperviseeFilters, value: any) => void;
}
