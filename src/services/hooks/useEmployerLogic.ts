import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEmployers } from '@/services/hooks/useEmployers';
import { useEmployerStates } from '@/services/hooks/useEmployerStates';
import { EmployerFilters } from '@/services/types/employer';

export const useEmployerLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): EmployerFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      const urlName = searchParams.get('name');
      const urlLocation = searchParams.get('location');
      const urlStatus = searchParams.get('status');
      
      const urlFilters = {
        page: Math.max(1, parseInt(urlPage || '1', 10)),
        limit: parseInt(urlLimit || '100', 10),
        name: urlName || '',
        location: urlLocation || '',
        status: urlStatus || undefined,
      };
      
      const isSimpleNavigation = 
        (!urlPage || urlPage === '1') &&
        !urlName &&
        !urlLocation &&
        !urlStatus;
      
      if (isSimpleNavigation && typeof window !== 'undefined') {
        localStorage.removeItem('employer-search-state');
        localStorage.removeItem('employer-scroll-position');
      }
      
      return urlFilters;
    }

    if (typeof window !== 'undefined') {
      const navigationFlag = sessionStorage.getItem('employer-preserve-state');
      
      if (navigationFlag === 'true') {
        sessionStorage.removeItem('employer-preserve-state');
        
        const savedState = localStorage.getItem('employer-search-state');
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            return {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 100,
              name: parsed.name || '',
              location: parsed.location || '',
              status: parsed.status || undefined,
            };
          } catch (error) {
            console.warn('Failed to parse saved employer state:', error);
          }
        }
      } else {
        localStorage.removeItem('employer-search-state');
        localStorage.removeItem('employer-scroll-position');
      }
    }
    
    return {
      page: 1,
      limit: 100,
      name: '',
      location: '',
      status: undefined,
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<EmployerFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.name || '';
    return initial;
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  useEffect(() => {
    setIsInitialized(true);

    if (initialFilters.name || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.name, initialFilters.page]);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('employer-scroll-position');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [searchParams]); 

  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        const hasUrlParams = Array.from(new URLSearchParams(window.location.search).keys()).length > 0;
        
        if (!hasUrlParams && typeof window !== 'undefined') {
          const savedPosition = localStorage.getItem('employer-scroll-position');
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

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set('limit', filters.limit.toString());
    if (filters.name) params.set('name', filters.name);
    if (filters.location) params.set('location', filters.location);
    if (filters.status) params.set('status', filters.status);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/employers${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('employer-scroll-position', position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('employer-scroll-position');
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
        name: filters.name,
        location: filters.location,
        status: filters.status,
      };
      localStorage.setItem('employer-search-state', JSON.stringify(stateToSave));
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useEmployers(filters);
  const { data: statesData, isLoading: isStatesLoading } = useEmployerStates();  const tableColumns = useMemo(() => [
    { key: 'select', label: '', className: 'w-16' },
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'state', label: 'Location' },
    { key: 'jobPostCount', label: 'Job Posts' },
    { key: 'dateJoined', label: 'Registration date' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ], []);
  const stateOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All States' }];
    
    if (statesData?.success && statesData.data?.states) {
      const dynamicOptions = statesData.data.states.map(state => ({
        value: state.abbreviation,
        label: state.name
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    return baseOptions;
  }, [statesData]);

  const itemsPerPageOptions = useMemo(() => [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
  ], []);

  const filterChange = useMemo(() => (key: keyof EmployerFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value === '' ? undefined : value,
        page: 1
      }));
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status.toLowerCase()) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      default: return 'light';
    }
  }, []);
  const viewEmployer = useCallback((employerId: string) => {
    saveScrollPosition();
    saveSearchState();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('employer-preserve-state', 'true');
      sessionStorage.setItem('employer-selected-item', employerId);
    }
    
    router.push(`/admin/employers/details/${employerId}`);
  }, [router, saveScrollPosition, saveSearchState]);
  const viewSubscription = (employerId: string) => {
    router.push(`/admin/subscriptions?employerId=${employerId}`);
  };

  const employerSelect = (employerId: string, isSelected: boolean) => {
    setSelectedEmployerId(isSelected ? employerId : null);
  };  const onCreateJob = () => {
    if (selectedEmployerId) {
      setIsCreatingJob(true);
      setTimeout(() => {
        router.push(`/admin/jobs/create-job?id=${selectedEmployerId}`);
      }, 100);
    }
  };
  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      name: '',
      location: '',
      status: undefined,
    };
    setFilters(newFilters);
    setSearchInput('');
    setSelectedEmployerId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('employer-scroll-position');
      localStorage.removeItem('employer-search-state');
    }
  }, []);

  const clearIndividualFilter = useCallback((filterType: string) => {
    switch (filterType) {
      case 'location':
        filterChange('location', '');
        break;
      case 'status':
        filterChange('status', undefined);
        break;
      default:
        break;
    }
  }, [filterChange]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.status ||
      selectedEmployerId
    );
  }, [searchInput, filters.location, filters.status, selectedEmployerId]);

  useEffect(() => {
    if (data && !isLoading) {
      const hasUrlParams = searchParams.toString();
      
      if (hasUrlParams) {
        restoreScrollPosition();
      } else {
        import('@/services/utils/autoScroll').then(({ restoreScrollWithItemHighlight }) => {
          restoreScrollWithItemHighlight(
            'employer-selected-item',
            'employer-scroll-position'
          );
        });
      }
    }
  }, [data, isLoading, searchParams, restoreScrollPosition]);

  useEffect(() => {
    const isOnPageOneWithNoFilters = 
      filters.page === 1 &&
      !filters.name &&
      !filters.location &&
      !filters.status;
    
    if (isOnPageOneWithNoFilters) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('employer-search-state');
        localStorage.removeItem('employer-scroll-position');
      }
    } else if (filters.name || filters.location || filters.status || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  useEffect(() => {
    if (!isInitialized) return;

    if (hasRestoredFromState && searchInput === initialFilters.name) return;
    
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        const shouldResetPage = searchInput !== filters.name;
        setFilters(prev => ({ 
          ...prev, 
          name: searchInput, 
          page: shouldResetPage ? 1 : prev.page 
        }));

        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.name, hasRestoredFromState, initialFilters.name]);
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
    statesData,
    isStatesLoading,
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,    
    filterChange,
    initPageChange,
    getStatusVariant,
    viewEmployer,
    viewSubscription,    
    selectedEmployerId,
    employerSelect,
    onCreateJob,
    isCreatingJob,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
