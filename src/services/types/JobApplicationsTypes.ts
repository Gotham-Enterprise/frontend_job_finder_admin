import { JobApplicationFilters } from './jobApplication';

export interface JobApplicationsProps {
  className?: string;
}

export interface JobApplicationsHeaderProps {
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
  filterContent?: React.ReactNode;
}

export interface JobApplicationsFiltersProps {
  isOpen: boolean;
  filters: JobApplicationFilters;
  onFilterChange: (key: keyof JobApplicationFilters, value: any) => void;
  stateOptions: Array<{ value: string; label: string }>;
  cityOptions: Array<{ value: string; label: string }>;
  isLoadingCities: boolean;
  statusOptions: Array<{ value: string; label: string }>;
  selectedStatuses: string[];
  onStatusToggle: (statuses: string[]) => void;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
}

export interface JobApplicationsTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  onViewJobApplication: (jobApplicationId: string) => void;
  onViewResume: (resumeObjectKey: string, fileName?: string) => void;
  isViewingResume: boolean;
}

export interface JobApplicationsTablePaginationProps {
  data: any;
  filters: JobApplicationFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof JobApplicationFilters, value: any) => void;
}
