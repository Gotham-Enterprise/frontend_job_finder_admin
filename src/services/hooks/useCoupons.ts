import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponApi } from '../api/coupon';
import { CouponFilters } from '../types/coupon';
import { CreateCouponFormData } from '../types/CouponsTypes';
import { showToast } from '../utils/toast';

export const couponQueryKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponQueryKeys.all, 'list'] as const,
  list: (filters: CouponFilters) => {
    const serializedFilters = JSON.stringify(filters, Object.keys(filters).sort());
    return [...couponQueryKeys.lists(), serializedFilters] as const;
  },
};

export const useCoupons = (filters: CouponFilters = {}) => {
  return useQuery({
    queryKey: couponQueryKeys.list(filters),
    queryFn: async () => {
      try {
        const result = await couponApi.getCoupons(filters);
        return result;
      } catch (error: any) {

        throw error;
      }
    },
    staleTime: 0, 
    gcTime: 1000 * 60 * 2, 
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      if (error.message.includes('HTTP 500')) {
        return false;
      }
   
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponFormData) => couponApi.createCoupon(data),
    onSuccess: (data) => {
     
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.all });
      
      showToast.success(
        'Coupon Created!', 
        `Coupon "${data.title || 'New coupon'}" has been created successfully.`
      );
    },
    onError: (error: any) => {
      
      let errorMessage = 'Failed to create coupon. Please try again.';
      
      if (error.message === 'Request timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Creation Failed', errorMessage);
    },
  });
};
