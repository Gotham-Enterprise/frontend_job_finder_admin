import { CouponFilters } from '@/services/types/coupon';

export interface CouponsProps {
  className?: string;
}

export interface CouponsHeaderProps {
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onCreateCoupon: () => void;
  filterContent?: React.ReactNode;
}

export interface CouponsFiltersProps {
  isOpen: boolean;
  filters: CouponFilters;
  onFilterChange: (key: keyof CouponFilters, value: any) => void;
  statusOptions: Array<{ value: string; label: string }>;
  selectedStatuses: string[];
  onStatusToggle: (statuses: string[]) => void;
  hasActiveFilters: boolean;
}

export interface CouponsTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  onViewCoupon: (couponId: string) => void;
}

export interface CouponsTablePaginationProps {
  data: any;
  filters: CouponFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof CouponFilters, value: any) => void;
}

export interface CreateCouponFormData {
  title: string;
  description: string;
  isOnlyAdminCanApply: boolean;
  discountType: 'amount' | 'percentage';
  amountOffInCents?: number;
  percentOff?: number;
}

export interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponFormData) => Promise<void>;
  isLoading?: boolean;
}
