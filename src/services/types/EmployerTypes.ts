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
}

export interface EmployerFiltersProps {
  isOpen: boolean;
  filters: EmployerFilters;
  onFilterChange: (key: keyof EmployerFilters, value: any) => void;
  stateOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
}

export interface EmployerTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  onViewEmployer: (employerId: string) => void;
  onViewSubscription: (employerId: string) => void;
}

export interface EmployerTablePaginationProps {
  data: any;
  filters: EmployerFilters;
  onPageChange: (page: number) => void;
}
