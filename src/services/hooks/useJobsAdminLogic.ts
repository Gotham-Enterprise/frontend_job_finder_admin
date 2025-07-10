import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobsAdmin, useJobsAdminOccupations } from '@/services/hooks/useJobsAdmin';
import { useStates } from '@/services/hooks/useStates';
import { JobsAdminFilters, Specialty } from '@/services/types/jobsAdmin';

export const useJobsAdminLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobsAdminFilters => {
    // First, try to get from URL parameters
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
      
      return {
        page: Math.max(1, parseInt(urlPage || '1', 10)),
        limit: parseInt(urlLimit || '100', 10),
        name: urlName || '',
        state: urlState || '',
        jobStatus: (urlJobStatus === 'Draft' || urlJobStatus === 'Published') ? urlJobStatus : undefined,
        datePosted: urlDatePosted || '',
        occupationId: urlOccupationId ? parseInt(urlOccupationId) : undefined,
        specialtyId: urlSpecialtyId ? parseInt(urlSpecialtyId) : undefined,
      };
    }
    
    // If no URL parameters, try to restore from localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobs-admin-search-state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          return {
            page: Math.max(1, parsed.page || 1),
            limit: parsed.limit || 100,
            name: parsed.name || '',
            state: parsed.state || '',
            jobStatus: parsed.jobStatus || undefined,
            datePosted: parsed.datePosted || '',
            occupationId: parsed.occupationId || undefined,
            specialtyId: parsed.specialtyId || undefined,
          };
        } catch (error) {
          console.warn('Failed to parse saved jobs admin state:', error);
        }
      }
    }
    
    // Default fallback
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
  const [filters, setFilters] = useState<JobsAdminFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.name || '';
    return initial;
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(initialFilters.occupationId);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>(
    initialFilters.jobStatus ? [initialFilters.jobStatus] : []
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialization effect - mark as initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // URL update effect - separate from direct calls to avoid render issues
  useEffect(() => {
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
  }, [filters, router]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('jobs-admin-scroll-position', position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobs-admin-scroll-position');
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
      localStorage.setItem('jobs-admin-search-state', JSON.stringify(stateToSave));
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
        page: 1, 
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
      setFilters(prev => ({ ...prev, jobStatus, page: 1 }));
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
      localStorage.removeItem('jobs-admin-scroll-position');
      localStorage.removeItem('jobs-admin-search-state');
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
        const savedPosition = localStorage.getItem('jobs-admin-scroll-position');
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
    if (filters.name || filters.state || filters.jobStatus || filters.datePosted || filters.occupationId || filters.specialtyId || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  useEffect(() => {
    // Don't trigger search during initial component mount to avoid resetting page
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        // Only reset to page 1 if this is a new search (different from current filters.name)
        const shouldResetPage = searchInput !== filters.name;
        setFilters(prev => ({ 
          ...prev, 
          name: searchInput, 
          page: shouldResetPage ? 1 : prev.page 
        }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.name]);

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
