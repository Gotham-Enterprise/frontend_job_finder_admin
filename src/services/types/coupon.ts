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
  durationInMonths: number | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  deactivatedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CouponListStatus = 'active' | 'inactive' | 'deleted';

export interface CouponFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  isActive?: boolean;
  status?: CouponListStatus[];
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponRedeemer {
  companyId: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  redeemedAt: string;
  stillApplied: boolean;
}

export interface CouponRedemptionsResponse {
  success: boolean;
  data: {
    couponId: string;
    title: string;
    redemptionCount: number;
    redeemers: CouponRedeemer[];
  };
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
