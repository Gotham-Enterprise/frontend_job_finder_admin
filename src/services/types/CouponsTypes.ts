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
  onEditCoupon: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export interface CouponsTablePaginationProps {
  data: any;
  filters: CouponFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof CouponFilters, value: any) => void;
}

export type CouponDuration = 'once' | 'repeating';

export interface CreateCouponFormData {
  title: string;
  description: string;
  isOnlyAdminCanApply: boolean;
  discountType: 'amount' | 'percentage';
  amountOffInCents?: number;
  percentOff?: number;
  duration: CouponDuration;
  durationInMonths?: number;
  maxRedemptions?: number;
}

export interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface UpdateCouponFormData {
  title: string;
  description: string;
}

export interface EditableCoupon {
  id: string;
  title: string;
  description?: string | null;
}

export interface EditCouponModalProps {
  isOpen: boolean;
  coupon: EditableCoupon | null;
  onClose: () => void;
  onSubmit: (data: UpdateCouponFormData) => Promise<void>;
  isLoading?: boolean;
}
