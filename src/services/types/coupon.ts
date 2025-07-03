export interface Coupon {
  id: string;
  title: string;
  description: string;
  redemptionCode: string;
  stripeCouponId: string;
  currency: string;
  isOnlyAdminCanApply: boolean;
  amountOffInCents: number | null;
  percentOff: number | null;
  duration: string;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}
