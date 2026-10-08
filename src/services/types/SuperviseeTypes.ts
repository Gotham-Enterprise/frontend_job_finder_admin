import { SuperviseeFilters, SuperviseesResponse } from "@/services/types/supervisee";

export interface SuperviseesProps {
  className?: string;
}

export interface SuperviseeHeaderProps {
  totalCount: number;
  isPending: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterDropdownContent?: React.ReactNode;
}

export interface SuperviseeFiltersProps {
  filters: SuperviseeFilters;
  onFilterChange: (key: keyof SuperviseeFilters, value: any) => void;
  clearIndividualFilter: (filterType: string) => void;
}

export interface SuperviseeTableProps {
  data: SuperviseesResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string; sortKey?: string }>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  onViewSupervisee: (superviseeId: string) => void;
  onEditSupervisee: (superviseeId: string, fullName: string) => void;
  onResendVerification: (superviseeId: string, fullName: string) => void;
  onApproveEmailVerification: (superviseeId: string, fullName: string) => void;
  onToggleHideProfile: (superviseeId: string, fullName: string, currentlyHidden: boolean) => void;
  onRefresh?: () => void;
}

export interface SuperviseeTablePaginationProps {
  data: SuperviseesResponse | undefined;
  filters: SuperviseeFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof SuperviseeFilters, value: any) => void;
}
