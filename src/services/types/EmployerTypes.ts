import { EmployerFilters } from '@/services/types/employer';

export interface EmployersProps {
  className?: string;
}

export interface EmployerHeaderProps {
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onRefetch: () => void;
  selectedEmployerId: string | null;
  onCreateJob: () => void;
  isCreatingJob: boolean;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterContent?: React.ReactNode;
}

export interface EmployerFiltersProps {
  isOpen: boolean;
  filters: EmployerFilters;
  onFilterChange: (key: keyof EmployerFilters, value: any) => void;
  stateOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  selectedStatuses: string[];
  onStatusToggle: (statuses: string[]) => void;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
}

export interface EmployerTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  onViewEmployer: (employerId: string) => void;
  onViewSubscription: (employerId: string) => void;
  selectedEmployerId: string | null;
  onEmployerSelect: (employerId: string, isSelected: boolean) => void;
}

export interface EmployerTablePaginationProps {
  data: any;
  filters: EmployerFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof EmployerFilters, value: any) => void;
}
