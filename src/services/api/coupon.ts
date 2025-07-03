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
    const requestBody: any = {
      title: data.title,
      description: data.description,
      isOnlyAdminCanApply: data.isOnlyAdminCanApply,
    };

    if (data.discountType === 'amount' && data.amountOffInCents) {
      requestBody.amountOffInCents = data.amountOffInCents;
    }
    
    if (data.discountType === 'percentage' && data.percentOff) {
      requestBody.percentOff = data.percentOff;
    }

    const endpoint = `/api/admin/coupons`;

    try {
 
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      const apiPromise = apiPost<any>(endpoint, requestBody);
      
      return await Promise.race([apiPromise, timeoutPromise]);
    } catch (error: any) {
      throw error;
    }
  },
};
