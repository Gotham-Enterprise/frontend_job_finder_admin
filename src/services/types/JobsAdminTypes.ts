import { JobsAdminFilters } from '@/services/types/jobsAdmin';

export interface JobsAdminProps {
  className?: string;
}

export interface JobsAdminHeaderProps {
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onRefetch: () => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export interface JobsAdminFiltersProps {
  filters: JobsAdminFilters;
  onFilterChange: (key: keyof JobsAdminFilters, value: any) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  stateOptions: Array<{ value: string; label: string }>;
  jobStatusOptions: Array<{ value: string; label: string }>;
  selectedOccupationId?: number;
  hasActiveFilters: boolean;
  selectedJobStatuses: string[];
  onJobStatusToggle: (statuses: string[]) => void;
}

export interface JobsAdminTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  getJobStatusVariant: (jobStatus: string) => 'light' | 'solid';
  onViewJobDetails: (jobId: string) => void;
  onEditJobPost: (jobId: string) => void;
}

export interface JobsAdminTablePaginationProps {
  data: any;
  filters: JobsAdminFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof JobsAdminFilters, value: any) => void;
}
