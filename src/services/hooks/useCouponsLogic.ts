import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoupons } from '@/services/hooks/useCoupons';
import { CouponFilters } from '@/services/types/coupon';

export const useCouponsLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<CouponFilters>({
    page: 1,
    limit: 100,
    keyword: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const normalizedFilters = useMemo(() => {
    const normalized: CouponFilters = {
      page: filters.page || 1,
      limit: filters.limit || 100,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    };

    if (filters.keyword) normalized.keyword = filters.keyword;
    if (filters.isActive !== undefined) normalized.isActive = filters.isActive;
    
    return normalized;
  }, [filters]);

  const { data, isLoading, error, refetch } = useCoupons(normalizedFilters);

  const tableColumns = useMemo(() => [
    { key: 'title', label: 'Title' },
    { key: 'redemptionCode', label: 'Redemption Code' },
    { key: 'discount', label: 'Discount' },
    { key: 'currency', label: 'Currency' },
    { key: 'duration', label: 'Duration' },
    { key: 'adminOnly', label: 'Admin Only' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'updatedAt', label: 'Updated Date' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ], []);

  const sortByOptions = useMemo(() => [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
  ], []);

  const sortOrderOptions = useMemo(() => [
    { value: 'desc', label: 'desc' },
    { value: 'asc', label: 'asc' },
  ], []);

  const itemsPerPageOptions = useMemo(() => [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
  ], []);

  const filterChange = useCallback((key: keyof CouponFilters, value: any) => {
    startTransition(() => {
      let processedValue = value;
      
      if (key === 'isActive') {
        processedValue = value === '' ? undefined : value === 'true';
      }
      
      const newFilters = { 
        ...filters, 
        [key]: processedValue === '' ? undefined : processedValue,
        page: 1
      };
      
      setFilters(newFilters);
    });
  }, [filters]);

  const handleStatusToggle = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    
    startTransition(() => {
      if (statuses.length === 0) {
        setFilters(prev => ({ ...prev, isActive: undefined, page: 1 }));
      } else if (statuses.length === 1) {
        const isActive = statuses[0] === 'true';
        setFilters(prev => ({ ...prev, isActive, page: 1 }));
      } else {
        setFilters(prev => ({ ...prev, isActive: undefined, page: 1 }));
      }
    });
  }, []);

  const initPageChange = useCallback((newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const viewCoupon = (couponId: string) => {
    console.log('View coupon:', couponId);
  };

  const formatDiscount = (coupon: any) => {
    if (coupon.amountOffInCents) {
      return `$${(coupon.amountOffInCents / 100).toFixed(2)}`;
    }
    if (coupon.percentOff) {
      return `${coupon.percentOff}%`;
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 100,
        keyword: '',
        isActive: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setSearchInput('');
      setSelectedStatuses([]);
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      selectedStatuses.length > 0
    );
  }, [searchInput, selectedStatuses]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, keyword: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    console.log('🔍 Filters updated in useCouponsLogic:', filters);
  }, [filters]);

  useEffect(() => {
    console.log('🎯 Normalized filters updated:', normalizedFilters);
  }, [normalizedFilters]);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    
    data,
    isLoading,
    error,
    refetch,
    
    tableColumns,
    statusOptions,
    sortByOptions,
    sortOrderOptions,
    itemsPerPageOptions,
    
    filterChange,
    initPageChange,
    viewCoupon,
    formatDiscount,
    formatDate,
    clearAllFilters,
    hasActiveFilters,
    selectedStatuses,
    handleStatusToggle,
  };
};
