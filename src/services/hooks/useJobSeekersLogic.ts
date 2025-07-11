import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobSeekers, useViewResume } from '@/services/hooks/useJobSeekers';
import { useOccupations } from '@/services/hooks/useOccupations';
import { useStates } from '@/services/hooks/useStates';
import { JobSeekerFilters } from '@/services/types/jobSeeker';

export const useJobSeekersLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobSeekerFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (hasUrlParams) {
      const searchParam = searchParams.get('search') || '';
      const decodedSearch = searchParam ? decodeURIComponent(searchParam) : '';
      const statusParam = searchParams.get('status');
      const validStatus = statusParam && ['active', 'inactive', 'pending', 'suspended'].includes(statusParam) 
        ? statusParam as 'active' | 'inactive' | 'pending' | 'suspended' 
        : undefined;
      
      const urlFilters = {
        page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
        limit: parseInt(searchParams.get('limit') || '100', 10),
        search: decodedSearch,
        location: searchParams.get('location') || '',
        occupationId: searchParams.get('occupationId') ? parseInt(searchParams.get('occupationId')!, 10) : undefined,
        status: validStatus,
      };
      
      return urlFilters;
    }
    
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobseeker-search-state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          const restoredFilters = {
            page: Math.max(1, parsed.page || 1),
            limit: parsed.limit || 100,
            search: parsed.search || '',
            location: parsed.location || '',
            occupationId: parsed.occupationId || undefined,
            status: parsed.status || undefined,
          };
          return restoredFilters;
        } catch (error) {
          console.warn('Failed to parse saved job seeker state:', error);
        }
      }
    }
    
    const defaultFilters = {
      page: 1,
      limit: 100,
      search: '',
      location: '',
      occupationId: undefined,
      status: undefined,
    };
    return defaultFilters;
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobSeekerFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.search || '';
    return initial;
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.status ? [initialFilters.status] : []
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scrollPosition, setScrollPosition] = useState(0  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  // Initialization effect - mark as initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
    // Mark as restored if we had initial filters with data
    if (initialFilters.search || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.search, initialFilters.page]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', encodeURIComponent(filters.search));
    if (filters.location) params.set('location', filters.location);
    if (filters.occupationId) params.set('occupationId', filters.occupationId.toString());
    if (filters.status) params.set('status', filters.status);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;
  
    if (newURL !== currentURL) {
      router.replace(`/admin/job-seekers${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);


  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobseeker-scroll-position');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: 'smooth' });
        }, 100);
      }
    }
  }, []); 


  useEffect(() => {
    const handlePopState = () => {
   
      setTimeout(() => {
        const hasUrlParams = Array.from(new URLSearchParams(window.location.search).keys()).length > 0;
        
        if (!hasUrlParams && typeof window !== 'undefined') {
          const savedPosition = localStorage.getItem('jobseeker-scroll-position');
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

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('jobseeker-scroll-position', position.toString());
      setScrollPosition(position);
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobseeker-scroll-position');
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
        search: filters.search,
        location: filters.location,
        occupationId: filters.occupationId,
        status: filters.status,
      };
      localStorage.setItem('jobseeker-search-state', JSON.stringify(stateToSave));
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useJobSeekers(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewResume();
  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'state', label: 'Location' },
    { key: 'resume', label: 'Resume' },
    { key: 'dateJoined', label: 'Registration date' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);
  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ], []);

  const occupationOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All Occupations' }];
    
    if (occupationsData?.success && occupationsData.data) {
      const dynamicOptions = occupationsData.data.map(occupation => ({
        value: occupation.id.toString(),
        label: occupation.name
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    return baseOptions;
  }, [occupationsData]);

  const stateOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All States' }];
    
    if (statesData?.success && statesData.data) {
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

  const filterChange = useCallback((key: keyof JobSeekerFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value === '' ? undefined : value,
        page: 1
      }));
    });
  }, []);

  const statusToggleChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        status: statuses.length > 0 ? statuses[0] as any : undefined,
        page: 1
      }));
    });
  }, []);

  const initPageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);
  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      case 'pending': return 'light';
      default: return 'light';
    }
  }, []);

  const initViewResume = useCallback(async (resumeId: string | null) => {
    if (!resumeId) {
      console.error('No resume ID provided');
      return;
    }
    
    viewResume(resumeId, {
      onSuccess: (data: any) => {
        if (data?.success && data?.data?.fileUrl) {
          window.open(data.data.fileUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.error('No file URL found in response');
        }
      },
      onError: (error) => {
        console.error('Error viewing resume:', error);
      }
    });
  }, [viewResume]);
  const viewJobSeeker = useCallback((jobSeekerId: string) => {
    
    saveScrollPosition();
    saveSearchState();
    
    router.push(`/admin/job-seekers/details/${jobSeekerId}`);
  }, [router, saveScrollPosition, saveSearchState]);

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      search: '',
      location: '',
      occupationId: undefined,
      status: undefined,
    };
    setFilters(newFilters);
    setSearchInput('');
    setSelectedStatuses([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobseeker-scroll-position');
      localStorage.removeItem('jobseeker-search-state');
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.occupationId ||
      selectedStatuses.length > 0
    );
  }, [searchInput, filters.location, filters.occupationId, selectedStatuses.length]);

  useEffect(() => {
    // Don't trigger search during initial component mount to avoid resetting page
    if (!isInitialized) return;
    
    // Don't trigger search if we're just restoring from state and haven't made a real change
    if (hasRestoredFromState && searchInput === initialFilters.search) return;
    
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        // Only reset to page 1 if this is a new search (different from current filters.search)
        const shouldResetPage = searchInput !== filters.search;
        setFilters(prev => ({ 
          ...prev, 
          search: searchInput, 
          page: shouldResetPage ? 1 : prev.page 
        }));
        
        // Clear the restored flag after first real search
        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.search, hasRestoredFromState, initialFilters.search]);

  useEffect(() => {
    if (data && !isLoading) {
  
      const hasUrlParams = searchParams.toString();
      
      if (hasUrlParams) {
      
        restoreScrollPosition();
      } else {
    
        const savedPosition = localStorage.getItem('jobseeker-scroll-position');
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
    if (filters.search || filters.location || filters.occupationId || filters.status || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  return {
    filters,
    searchInput,
    setSearchInput,
    selectedStatuses,
    setSelectedStatuses,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    
    data,
    isLoading,
    error,
    refetch,
    occupationsData,
    isOccupationsLoading,
    statesData,
    isStatesLoading,
    isViewingResume,
    
    tableColumns,
    statusOptions,
    occupationOptions,
    stateOptions,
    itemsPerPageOptions,

    filterChange,
    statusToggleChange,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobSeeker,
    clearAllFilters,
    hasActiveFilters,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
