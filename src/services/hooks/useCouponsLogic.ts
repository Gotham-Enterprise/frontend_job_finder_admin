import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoupons } from '@/services/hooks/useCoupons';
import { CouponFilters } from '@/services/types/coupon';

export const useCouponsLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): CouponFilters => {
    // First, try to get from URL parameters
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (hasUrlParams) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      const urlKeyword = searchParams.get('keyword');
      const urlIsActive = searchParams.get('isActive');
      const urlSortBy = searchParams.get('sortBy');
      const urlSortOrder = searchParams.get('sortOrder');
      
      return {
        page: Math.max(1, parseInt(urlPage || '1', 10)),
        limit: parseInt(urlLimit || '100', 10),
        keyword: urlKeyword || '',
        isActive: urlIsActive === 'true' ? true : urlIsActive === 'false' ? false : undefined,
        sortBy: (urlSortBy as 'createdAt' | 'updatedAt') || 'createdAt',
        sortOrder: (urlSortOrder as 'asc' | 'desc') || 'desc',
      };
    }
    
    // If no URL parameters, try to restore from localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('coupons-search-state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          return {
            page: Math.max(1, parsed.page || 1),
            limit: parsed.limit || 100,
            keyword: parsed.keyword || '',
            isActive: parsed.isActive,
            sortBy: parsed.sortBy || 'createdAt',
            sortOrder: parsed.sortOrder || 'desc',
          };
        } catch (error) {
          console.warn('Failed to parse saved coupons state:', error);
        }
      }
    }
    
    // Default fallback
    return {
      page: 1,
      limit: 100,
      keyword: '',
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<CouponFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.keyword || '';
    return initial;
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    if (initialFilters.isActive === true) return ['true'];
    if (initialFilters.isActive === false) return ['false'];
    return [];
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  // Initialization effect - mark as initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
    // Mark as restored if we had initial filters with data
    if (initialFilters.keyword || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.keyword, initialFilters.page]);

  // Restore scroll position when component mounts (only when state was restored from localStorage)
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('coupons-scroll-position');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: 'smooth' });
        }, 100);
      }
    }
  }, []); // Only run on mount

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Small delay to ensure the component has re-rendered with URL params
      setTimeout(() => {
        const hasUrlParams = Array.from(new URLSearchParams(window.location.search).keys()).length > 0;
        
        if (!hasUrlParams && typeof window !== 'undefined') {
          const savedPosition = localStorage.getItem('coupons-scroll-position');
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: 'smooth' });
          }
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // URL update effect - separate from direct calls to avoid render issues
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set('limit', filters.limit.toString());
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
    if (filters.sortBy && filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;
    
    // Only update URL if it's different to avoid unnecessary navigations
    if (newURL !== currentURL) {
      router.replace(`/admin/coupons${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('coupons-scroll-position', position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('coupons-scroll-position');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const saveSearchState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        page: filters.page,
        limit: filters.limit,
        keyword: filters.keyword,
        isActive: filters.isActive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      localStorage.setItem('coupons-search-state', JSON.stringify(stateToSave));
    }
  }, [filters]);

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
      } else if (key === 'limit') {
        processedValue = parseInt(value);
      } else if (key === 'page') {
        processedValue = parseInt(value);
      } else {
        processedValue = value === '' ? undefined : value;
      }
      
      const newFilters = { 
        ...filters, 
        [key]: processedValue,
        page: key === 'page' ? processedValue : 1
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

  const viewCoupon = useCallback((couponId: string) => {
    // Save current state and scroll position before navigating
    saveScrollPosition();
    saveSearchState();
    
    console.log('View coupon:', couponId);
    // Add navigation logic here when detail page exists
    // router.push(`/admin/coupons/details/${couponId}`);
  }, [saveScrollPosition, saveSearchState]);

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

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      keyword: '',
      isActive: undefined,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };
    setFilters(newFilters);
    setSearchInput('');
    setSelectedStatuses([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('coupons-scroll-position');
      localStorage.removeItem('coupons-search-state');
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      selectedStatuses.length > 0
    );
  }, [searchInput, selectedStatuses]);

  // Search effect with initialization check
  useEffect(() => {
    // Don't trigger search during initial component mount to avoid resetting page
    if (!isInitialized) return;
    
    // Don't trigger search if we're just restoring from state and haven't made a real change
    if (hasRestoredFromState && searchInput === initialFilters.keyword) return;
    
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        // Only reset to page 1 if this is a new search (different from current filters.keyword)
        const shouldResetPage = searchInput !== filters.keyword;
        setFilters(prev => ({ 
          ...prev, 
          keyword: searchInput, 
          page: shouldResetPage ? 1 : prev.page 
        }));
        
        // Clear the restored flag after first real search
        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.keyword, hasRestoredFromState, initialFilters.keyword]);

  // Save state when filters change
  useEffect(() => {
    if (filters.keyword || filters.isActive !== undefined || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  // Data loading effect for scroll restoration
  useEffect(() => {
    if (data && !isLoading) {
      // Check if we need to restore scroll position after data loads
      const hasUrlParams = searchParams.toString();
      
      if (hasUrlParams) {
        // If we have URL params, restore scroll position
        restoreScrollPosition();
      } else {
        // If no URL params, we might have restored from localStorage, so restore scroll too
        const savedPosition = localStorage.getItem('coupons-scroll-position');
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          setTimeout(() => {
            window.scrollTo({ top: position, behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [data, isLoading, searchParams, restoreScrollPosition]);

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
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
