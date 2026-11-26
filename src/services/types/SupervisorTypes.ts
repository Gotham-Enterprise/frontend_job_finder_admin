import { SupervisorFilters, SupervisorsResponse } from "@/services/types/supervisor";

/** Which list the page shows — Preceptors have their own page (and sidebar entry). */
export type SupervisorListVariant = "supervisors" | "preceptors";

export interface SupervisorListLabels {
  /** Plural heading, e.g. "Preceptors". */
  plural: string;
  /** Lower-case singular noun for copy, e.g. "preceptor". */
  singular: string;
  /** Lower-case plural noun for copy, e.g. "preceptors". */
  pluralLower: string;
}

export interface SupervisorsProps {
  className?: string;
  variant?: SupervisorListVariant;
}

export interface SupervisorHeaderProps {
  labels?: SupervisorListLabels;
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onRefetch: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterDropdownContent?: React.ReactNode;
}

export interface SupervisorFiltersProps {
  /** Hidden on the Preceptors page, which is locked to one type. */
  showTypeFilter?: boolean;
  filters: SupervisorFilters;
  onFilterChange: (key: keyof SupervisorFilters, value: any) => void;
  statusOptions: Array<{ value: string; label: string }>;
  typeOptions: Array<{ value: string; label: string }>;
  subscriptionOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
}

export interface SupervisorTableProps {
  labels?: SupervisorListLabels;
  data: SupervisorsResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string; sortKey?: string }>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  onViewSupervisor: (supervisorId: string) => void;
  onEditSupervisor: (supervisorId: string, fullName: string) => void;
  onApproveSupervisor: (supervisorId: string, fullName: string) => void;
  onRejectSupervisor: (supervisorId: string, fullName: string) => void;
  onResendVerification: (supervisorId: string, fullName: string) => void;
  onApproveEmailVerification: (supervisorId: string, fullName: string) => void;
  onToggleHideProfile: (supervisorId: string, fullName: string, currentlyHidden: boolean) => void;
  onRefresh?: () => void;
}

export interface SupervisorTablePaginationProps {
  data: SupervisorsResponse | undefined;
  filters: SupervisorFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof SupervisorFilters, value: any) => void;
}
