import { DeletedJobSeekerAccount, DeletedJobSeekersFilters } from "../api/deletedJobSeekers";

export interface DeletedJobSeekersProps {
  className?: string;
}

export interface DeletedJobSeekersHeaderProps {
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

export interface DeletedJobSeekersFiltersProps {
  filters: DeletedJobSeekersFilters;
  onFilterChange: (key: keyof DeletedJobSeekersFilters, value: any) => void;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterType: string) => void;
  adminUsers: Array<{ value: string; label: string }>;
}

export interface DeletedJobSeekersTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  onViewDetails: (deletedAccountId: string) => void;
  onRestoreAccount: (deletedAccount: DeletedJobSeekerAccount) => void;
  onRefresh?: () => void;
}

export interface DeletedJobSeekersTablePaginationProps {
  data: any;
  filters: DeletedJobSeekersFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof DeletedJobSeekersFilters, value: any) => void;
}

export interface RestoreAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedAccount: DeletedJobSeekerAccount | null;
  onRestore: (deletedAccountId: string, adminPassword: string) => Promise<void>;
  isRestoring: boolean;
}

export interface ViewDeletedDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedAccount: DeletedJobSeekerAccount | null;
  onRestore?: (deletedAccount: DeletedJobSeekerAccount) => void;
  isLoading: boolean;
}

export interface DeletedAccountDetailSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
}
