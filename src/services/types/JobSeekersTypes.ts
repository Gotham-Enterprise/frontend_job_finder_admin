import { JobSeekerFilters } from '@/services/types/jobSeeker';

export interface JobSeekersProps {
  className?: string;
}

export interface JobSeekersHeaderProps {
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
}

export interface JobSeekersFiltersProps {
  filters: JobSeekerFilters;
  onFilterChange: (key: keyof JobSeekerFilters, value: any) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  stateOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
}

export interface JobSeekersTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  onViewJobSeeker: (jobSeekerId: string) => void;
  onViewResume: (objectKey: string | null, fileName?: string) => void;
  isViewingResume: boolean;
  onRefresh?: () => void;
}

export interface JobSeekersTablePaginationProps {
  data: any;
  filters: JobSeekerFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof JobSeekerFilters, value: any) => void;
}
