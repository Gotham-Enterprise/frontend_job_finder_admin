import { CouponFilters, CouponsResponse } from '../types/coupon';
import { CreateCouponFormData } from '../types/CouponsTypes';
import { apiGet, apiPost } from './apiUtils';

export const couponApi = {
  async getCoupons(filters: CouponFilters = {}): Promise<CouponsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.keyword) queryParams.append('keyword', filters.keyword);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const endpoint = `/api/admin/coupons?${queryParams.toString()}`;
    
    try {
      return await apiGet<CouponsResponse>(endpoint);
    } catch (error: any) {
   
      throw error;
    }
  },

  async createCoupon(data: CreateCouponFormData): Promise<any> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('title', data.title);
    queryParams.append('description', data.description);
    queryParams.append('isOnlyAdminCanApply', data.isOnlyAdminCanApply.toString());
    
    if (data.discountType === 'amount' && data.amountOffInCents) {
      queryParams.append('amountOffInCents', data.amountOffInCents.toString());
    }
    
    if (data.discountType === 'percentage' && data.percentOff) {
      queryParams.append('percentOff', data.percentOff.toString());
    }

    const endpoint = `/api/admin/coupons?${queryParams.toString()}`;

    try {
      return await apiPost<any>(endpoint, {});
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },
};
