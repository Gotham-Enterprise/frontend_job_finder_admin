import { SupervisorFilters, SupervisorsResponse } from "@/services/types/supervisor";

export interface SupervisorsProps {
  className?: string;
}

export interface SupervisorHeaderProps {
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
  filters: SupervisorFilters;
  onFilterChange: (key: keyof SupervisorFilters, value: any) => void;
  statusOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
}

export interface SupervisorTableProps {
  data: SupervisorsResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  onViewSupervisor: (supervisorId: string) => void;
  onApproveSupervisor: (supervisorId: string, fullName: string) => void;
  onRejectSupervisor: (supervisorId: string, fullName: string) => void;
  onRefresh?: () => void;
}

export interface SupervisorTablePaginationProps {
  data: SupervisorsResponse | undefined;
  filters: SupervisorFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof SupervisorFilters, value: any) => void;
}
