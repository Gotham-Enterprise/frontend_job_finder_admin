import { SuperviseeFilters, SuperviseesResponse } from "@/services/types/supervisee";

/** Which list the page shows — Preceptees (students) have their own page. */
export type SuperviseeListVariant = "supervisees" | "preceptees";

export interface SuperviseeListLabels {
  plural: string;
  singular: string;
  pluralLower: string;
}

export interface SuperviseesProps {
  className?: string;
  variant?: SuperviseeListVariant;
}

export interface SuperviseeHeaderProps {
  labels?: SuperviseeListLabels;
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
  labels?: SuperviseeListLabels;
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
