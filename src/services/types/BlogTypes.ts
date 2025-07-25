import { BlogFilters } from '@/services/types/blog';

export interface AllBlogPostsProps {
  className?: string;
}

export interface BlogHeaderProps {
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
  selectedPosts: string[];
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isBulkDeleting: boolean;
}

export interface BlogFiltersProps {
  filters: BlogFilters;
  onFilterChange: (key: keyof BlogFilters, value: any) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  hasActiveFilters?: boolean;
  clearIndividualFilter?: (filterKey: string) => void;
}

export interface BlogTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusVariant: (status: string) => 'light' | 'solid';
  onEditPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  selectedPosts: string[];
  onSelectPost: (postId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export interface BlogTablePaginationProps {
  data: any;
  filters: BlogFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions?: Array<{ value: string; label: string }>;
  onFilterChange?: (key: keyof BlogFilters, value: any) => void;
}
