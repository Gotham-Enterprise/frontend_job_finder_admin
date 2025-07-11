import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobsAdmin, useJobsAdminOccupations } from '@/services/hooks/useJobsAdmin';
import { useStates } from '@/services/hooks/useStates';
import { JobsAdminFilters, Specialty } from '@/services/types/jobsAdmin';

export const useJobsAdminLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobsAdminFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (hasUrlParams) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      const urlName = searchParams.get('name');
      const urlState = searchParams.get('state');
      const urlJobStatus = searchParams.get('jobStatus');
      const urlDatePosted = searchParams.get('datePosted');
      const urlOccupationId = searchParams.get('occupationId');
      const urlSpecialtyId = searchParams.get('specialtyId');
      
      const urlFilters: JobsAdminFilters = {
        page: urlPage ? Math.max(1, parseInt(urlPage, 10)) : 1,
        limit: urlLimit ? parseInt(urlLimit, 10) : 100,
        name: urlName || '',
        state: urlState || '',
        jobStatus: (urlJobStatus === 'Draft' || urlJobStatus === 'Published') ? urlJobStatus as 'Draft' | 'Published' : undefined,
        datePosted: urlDatePosted || '',
        occupationId: urlOccupationId ? parseInt(urlOccupationId) : undefined,
        specialtyId: urlSpecialtyId ? parseInt(urlSpecialtyId) : undefined,
      };
      
      return urlFilters;
    }

    if (typeof window !== 'undefined') {
      const navigationFlag = sessionStorage.getItem('jobsAdmin-preserve-state');
      
      if (navigationFlag === 'true') {
        sessionStorage.removeItem('jobsAdmin-preserve-state');
        
        const savedState = localStorage.getItem('jobsAdmin-search-state');
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            const restoredFilters = {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 100,
              name: parsed.name || '',
              state: parsed.state || '',
              jobStatus: parsed.jobStatus || undefined,
              datePosted: parsed.datePosted || '',
              occupationId: parsed.occupationId || undefined,
              specialtyId: parsed.specialtyId || undefined,
            };
            
            return restoredFilters;
          } catch (error) {
            console.warn('Failed to parse saved jobs admin state:', error);
          }
        }
      } else {
        localStorage.removeItem('jobsAdmin-search-state');
        localStorage.removeItem('jobsAdmin-scroll-position');
      }
    }
    return {
      page: 1,
      limit: 100,
      name: '',
      state: '',
      jobStatus: undefined,
      datePosted: '',
      occupationId: undefined,
      specialtyId: undefined,
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobsAdminFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.name || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(initialFilters.occupationId);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>(
    initialFilters.jobStatus ? [initialFilters.jobStatus] : []
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);
  const [initialSearchValue, setInitialSearchValue] = useState(initialFilters.name || '');

  useEffect(() => {
    setIsInitialized(true);
  
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (hasUrlParams || initialFilters.name || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.name, initialFilters.page, searchParams]);

 
  useEffect(() => {
    if (!isInitialized) return;
    
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    const urlPage = searchParams.get('page');
    
 
    if (hasUrlParams && !urlPage && filters.page && filters.page > 1) {
      const params = new URLSearchParams(window.location.search);
      params.set('page', filters.page.toString());
      
      const newURL = `?${params.toString()}`;
      router.replace(`/admin/jobs${newURL}`, { scroll: false });
    }
  }, [isInitialized, searchParams, filters.page, router]);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobsAdmin-scroll-position');
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
          const savedPosition = localStorage.getItem('jobsAdmin-scroll-position');
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: 'smooth' });
          }
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams]);

 
  useEffect(() => {
    // Don't update URL during initial mount to avoid interfering with restoration
    if (!isInitialized) return;
    
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set('limit', filters.limit.toString());
    if (filters.name) params.set('name', filters.name);
    if (filters.state) params.set('state', filters.state);
    if (filters.jobStatus) params.set('jobStatus', filters.jobStatus);
    if (filters.datePosted) params.set('datePosted', filters.datePosted);
    if (filters.occupationId) params.set('occupationId', filters.occupationId.toString());
    if (filters.specialtyId) params.set('specialtyId', filters.specialtyId.toString());
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;
    
    // Only update URL if it's different to avoid unnecessary navigations
    if (newURL !== currentURL) {
      router.replace(`/admin/jobs${newURL}`, { scroll: false });
    }
  }, [filters, router, isInitialized]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('jobsAdmin-scroll-position', position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobsAdmin-scroll-position');
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
        state: filters.state,
        jobStatus: filters.jobStatus,
        datePosted: filters.datePosted,
        occupationId: filters.occupationId,
        specialtyId: filters.specialtyId,
      };
      localStorage.setItem('jobsAdmin-search-state', JSON.stringify(stateToSave));
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useJobsAdmin(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useJobsAdminOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();

  const tableColumns = useMemo(() => [
    { key: 'title', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'location', label: 'Location' },
    { key: 'datePosted', label: 'Date Posted' },
    { key: 'status', label: 'Status' },
    { key: 'jobStatus', label: 'Job Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const jobStatusOptions = useMemo(() => [
    { value: '', label: 'All Job Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Published', label: 'Published' },
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

  const specialtyOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All Specialties' }];
    
    if (selectedOccupationId && occupationsData?.success && occupationsData.data) {
      const selectedOccupation = occupationsData.data.find(
        occupation => occupation.id === selectedOccupationId
      );
      
      if (selectedOccupation?.specialty) {
        const dynamicOptions = selectedOccupation.specialty.map((specialty: Specialty) => ({
          value: specialty.id.toString(),
          label: specialty.name
        }));
        return [...baseOptions, ...dynamicOptions];
      }
    }
    
    return baseOptions;
  }, [selectedOccupationId, occupationsData]);

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
  ], []);  const filterChange = useMemo(() => (key: keyof JobsAdminFilters, value: any) => {
    startTransition(() => {
      let processedValue = value;
 
      if (key === 'occupationId' || key === 'specialtyId') {
        processedValue = value === '' ? undefined : parseInt(value);
      } else if (key === 'limit') {
        processedValue = parseInt(value);
      } else if (key === 'jobStatus') {
        processedValue = value === '' ? undefined : value;
      } else {
        processedValue = value === '' ? undefined : value;
      }

      const newFilters = { 
        ...filters, 
        [key]: processedValue,
        // Only reset page to 1 for filter changes, not for page or limit changes
        ...(key !== 'page' && key !== 'limit' && { page: 1 }),
        ...(key === 'occupationId' && { specialtyId: undefined })
      };
      setFilters(newFilters);
      
      if (key === 'occupationId') {
        setSelectedOccupationId(value === '' ? undefined : parseInt(value));
      }
    });
  }, [filters]);

  const jobStatusToggle = useCallback((statuses: string[]) => {
    setSelectedJobStatuses(statuses);
    startTransition(() => {
      const jobStatus = statuses.length > 0 ? statuses[0] as 'Draft' | 'Published' : undefined;
      setFilters(prev => ({ 
        ...prev, 
        jobStatus, 
        // Only reset page if the status actually changed
        ...(prev.jobStatus !== jobStatus && { page: 1 })
      }));
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status?.toLowerCase()) {
      case 'open': return 'solid';
      case 'closed': return 'light';
      case 'paused': return 'light';
      default: return 'light';
    }
  }, []);

  const getJobStatusVariant = useMemo(() => (jobStatus: string): 'light' | 'solid' => {
    switch (jobStatus?.toLowerCase()) {
      case 'published': return 'solid';
      case 'draft': return 'light';
      default: return 'light';
    }
  }, []);

  const viewJobDetails = useCallback((jobId: string) => {
    // Save current state and scroll position before navigating
    saveScrollPosition();
    saveSearchState();
    
    // Set flag to preserve state when returning
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('jobsAdmin-preserve-state', 'true');
      // Save the specific item ID for auto-scroll
      sessionStorage.setItem('jobsAdmin-selected-item', jobId);
    }
    
    router.push(`/admin/jobs/details/${jobId}`);
  }, [router, saveScrollPosition, saveSearchState]);

  const editJobPost = (jobId: string) => {
    router.push(`/admin/jobs/edit-job?id=${jobId}`);
  };

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      name: '',
      state: '',
      jobStatus: undefined,
      datePosted: '',
      occupationId: undefined,
      specialtyId: undefined,
    };
    setFilters(newFilters);
    setSearchInput('');
    setSelectedOccupationId(undefined);
    setSelectedJobStatuses([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobsAdmin-scroll-position');
      localStorage.removeItem('jobsAdmin-search-state');
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.state ||
      filters.jobStatus ||
      filters.datePosted ||
      filters.occupationId ||
      filters.specialtyId ||
      selectedJobStatuses.length > 0
    );
  }, [searchInput, filters.state, filters.jobStatus, filters.datePosted, filters.occupationId, filters.specialtyId, selectedJobStatuses]);

  useEffect(() => {
    if (data && !isLoading) {
      // Check if we need to restore scroll position after data loads
      const hasUrlParams = searchParams.toString();
      
      if (hasUrlParams) {
        // If we have URL params, restore scroll position
        restoreScrollPosition();
      } else {
        // If no URL params, we might have restored from localStorage, so restore scroll too
        const savedPosition = localStorage.getItem('jobsAdmin-scroll-position');
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
    // Only save state after initialization to avoid interfering with restoration
    if (!isInitialized) return;
    
    if (filters.name || filters.state || filters.jobStatus || filters.datePosted || filters.occupationId || filters.specialtyId || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState, isInitialized]);

  useEffect(() => {
    // Don't trigger search during initial component mount to avoid resetting page
    if (!isInitialized) return;
    
    // Don't trigger search if we're just restoring from state and haven't made a real change
    if (hasRestoredFromState && searchInput === initialSearchValue) {
      return;
    }
    
    // Don't trigger if the searchInput matches what's already in filters (prevents loops)
    if (searchInput === filters.name) {
      return;
    }
    
    // Only proceed if there's an actual change from user input
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ 
          ...prev, 
          name: searchInput, 
          // Only reset to page 1 if the search value actually changed from previous value
          ...(searchInput !== prev.name && { page: 1 })
        }));
        
        // Clear the restored flag after first real search
        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.name, hasRestoredFromState, initialSearchValue]);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedOccupationId,
    
    data,
    isLoading,
    error,
    refetch,
    occupationsData,
    isOccupationsLoading,
    statesData,
    isStatesLoading,
    
    tableColumns,
    jobStatusOptions,
    occupationOptions,
    specialtyOptions,
    stateOptions,
    itemsPerPageOptions,

    filterChange,
    jobStatusToggle,
    initPageChange,
    getStatusVariant,
    getJobStatusVariant,
    viewJobDetails,
    editJobPost,
    clearAllFilters,
    hasActiveFilters,
    selectedJobStatuses,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
