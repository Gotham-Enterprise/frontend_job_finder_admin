import { JobsAdminFilters } from "@/services/types/jobsAdmin";
import { ReactNode } from "react";

export interface JobsAdminProps {
  className?: string;
}

export interface JobsAdminHeaderProps {
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  companyNameInput: string;
  setCompanyNameInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onRefetch: () => void;
  hasActiveFilters: boolean;
}

export interface JobsAdminFiltersProps {
  filters: JobsAdminFilters;
  onFilterChange: (key: keyof JobsAdminFilters, value: any) => void;
  onClearIndividualFilter: (key: keyof JobsAdminFilters) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  stateOptions: Array<{ value: string; label: string }>;
  cityOptions: Array<{ value: string; label: string }>;
  isLoadingCities: boolean;
  jobStatusOptions: Array<{ value: string; label: string }>;
  jobSourceOptions: Array<{ value: string; label: string }>;
  selectedOccupationId?: number;
  hasActiveFilters: boolean;
  selectedJobStatuses: string[];
  onJobStatusToggle: (statuses: string[]) => void;
}

export interface JobsAdminTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string | ReactNode; className?: string }>;
  getStatusVariant: (status: string) => "light" | "solid";
  getJobStatusVariant: (jobStatus: string) => "light" | "solid";
  onViewJobDetails: (jobId: string) => void;
  onEditJobPost: (jobId: string) => void;
  onDeleteJobPost: (jobId: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleteDialogOpen: boolean;
  isDeletingJob: boolean;
}

export interface JobsAdminTablePaginationProps {
  data: any;
  filters: JobsAdminFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof JobsAdminFilters, value: any) => void;
}
