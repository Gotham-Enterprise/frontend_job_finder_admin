import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobApplications, useViewApplicationResume } from '@/services/hooks/useJobApplications';
import { useStates } from '@/services/hooks/useStates';
import { JobApplicationFilters } from '@/services/types/jobApplication';

export const useJobApplicationsLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobApplicationFilters => {
    // First, try to get from URL parameters
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (hasUrlParams) {
      const nameParam = searchParams.get('name') || '';
      const decodedName = nameParam ? decodeURIComponent(nameParam) : '';
      
      return {
        page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
        limit: parseInt(searchParams.get('limit') || '100', 10),
        name: decodedName,
        location: searchParams.get('location') || '',
        companyName: searchParams.get('companyName') || '',
        status: searchParams.get('status') || '',
      };
    }
    
    // If no URL parameters, try to restore from localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobApplications-search-state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          return {
            page: Math.max(1, parsed.page || 1),
            limit: parsed.limit || 100,
            name: parsed.name || '',
            location: parsed.location || '',
            companyName: parsed.companyName || '',
            status: parsed.status || '',
          };
        } catch (error) {
          console.warn('Failed to parse saved job applications state:', error);
        }
      }
    }
    
    // Default fallback
    return {
      page: 1,
      limit: 100,
      name: '',
      location: '',
      companyName: '',
      status: '',
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobApplicationFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.name || '';
    return initial;
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.status ? [initialFilters.status] : []
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  // Initialization effect - mark as initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
    // Mark as restored if we had initial filters with data
    if (initialFilters.name || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.name, initialFilters.page]);

  // Restore scroll position when component mounts (only when state was restored from localStorage)
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    
    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobApplications-scroll-position');
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
          const savedPosition = localStorage.getItem('jobApplications-scroll-position');
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

  const { data, isLoading, error, refetch } = useJobApplications(filters);
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewApplicationResume();

  // URL update effect - separate from direct calls to avoid render issues
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set('limit', filters.limit.toString());
    if (filters.name) params.set('name', encodeURIComponent(filters.name));
    if (filters.location) params.set('location', filters.location);
    if (filters.companyName) params.set('companyName', filters.companyName);
    if (filters.status) params.set('status', filters.status);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;
    
    // Only update URL if it's different to avoid unnecessary navigations
    if (newURL !== currentURL) {
      router.replace(`/admin/applications${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const position = window.scrollY;
      localStorage.setItem('jobApplications-scroll-position', position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('jobApplications-scroll-position');
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
        companyName: filters.companyName,
        status: filters.status,
      };
      localStorage.setItem('jobApplications-search-state', JSON.stringify(stateToSave));
    }
  }, [filters]);

  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Applicant' },
    { key: 'company', label: 'Company' },
    { key: 'location', label: 'Location' },
    { key: 'resume', label: 'Resume' },
    { key: 'applicationDate', label: 'Application Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'New Application', label: 'New Application' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Interview Scheduled', label: 'Interview Scheduled' },
    { value: 'Offer Extended', label: 'Offer Extended' },
    { value: 'Hired', label: 'Hired' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Withdrawn', label: 'Withdrawn' },
  ], []);

  const stateOptions = useMemo(() => {
    if (!statesData?.success || !statesData?.data?.states) {
      return [{ value: '', label: 'All Locations' }];
    }
    
    return [
      { value: '', label: 'All Locations' },
      ...statesData.data.states.map((state: any) => ({
        value: state.abbreviation,
        label: state.name,
      }))
    ];
  }, [statesData]);

  const itemsPerPageOptions = useMemo(() => [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
  ], []);

  const filterChange = useMemo(() => (key: keyof JobApplicationFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value === '' ? undefined : value,
        page: 1
      }));
    });
  }, []);

  const handleStatusToggle = useMemo(() => (statuses: string[]) => {
    setSelectedStatuses(statuses);
    
    startTransition(() => {
      if (statuses.length === 0) {
        setFilters(prev => ({ ...prev, status: '', page: 1 }));
      } else if (statuses.length === 1) {
        setFilters(prev => ({ ...prev, status: statuses[0], page: 1 }));
      } else {
        // Multiple statuses selected, remove the filter
        setFilters(prev => ({ ...prev, status: '', page: 1 }));
      }
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status.toLowerCase()) {
      case 'new application': return 'solid';
      case 'under review': return 'solid';
      case 'interview scheduled': return 'solid';
      case 'offer extended': return 'solid';
      case 'hired': return 'solid';
      case 'rejected': return 'light';
      case 'withdrawn': return 'light';
      default: return 'light';
    }
  }, []);

  const initViewResume = async (resumeObjectKey: string) => {
    if (!resumeObjectKey) {
      console.error('No resume object key provided');
      return;
    }
    
    viewResume(resumeObjectKey, {
      onSuccess: (data: any) => {
        if (data?.success && data?.data?.fileUrl) {
          window.open(data.data.fileUrl, '_blank', 'noopener,noreferrer');
        } else if (data?.fileUrl) {
          window.open(data.fileUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.error('No file URL found in response', data);
        }
      },
      onError: (error) => {
        console.error('Error viewing resume:', error);
      }
    });
  };

  const viewJobApplication = useCallback((jobApplicationId: string) => {
    // Save current state and scroll position before navigating
    saveScrollPosition();
    saveSearchState();
    
    router.push(`/admin/applications/details/${jobApplicationId}`);
  }, [router, saveScrollPosition, saveSearchState]);

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      name: '',
      location: '',
      companyName: '',
      status: '',
    };
    setFilters(newFilters);
    setSearchInput('');
    setSelectedStatuses([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobApplications-scroll-position');
      localStorage.removeItem('jobApplications-search-state');
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.companyName ||
      selectedStatuses.length > 0
    );
  }, [searchInput, filters.location, filters.companyName, selectedStatuses]);

  useEffect(() => {
    if (data && !isLoading) {
      // Check if we need to restore scroll position after data loads
      const hasUrlParams = searchParams.toString();
      
      if (hasUrlParams) {
        // If we have URL params, restore scroll position
        restoreScrollPosition();
      } else {
        // If no URL params, we might have restored from localStorage, so restore scroll too
        const savedPosition = localStorage.getItem('jobApplications-scroll-position');
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
    if (filters.name || filters.location || filters.companyName || filters.status || (filters.page && filters.page > 1)) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  useEffect(() => {
    // Don't trigger search during initial component mount to avoid resetting page
    if (!isInitialized) return;
    
    // Don't trigger search if we're just restoring from state and haven't made a real change
    if (hasRestoredFromState && searchInput === initialFilters.name) return;
    
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        // Only reset to page 1 if this is a new search (different from current filters.name)
        const shouldResetPage = searchInput !== filters.name;
        setFilters(prev => ({ 
          ...prev, 
          name: searchInput, 
          page: shouldResetPage ? 1 : prev.page 
        }));
        
        // Clear the restored flag after first real search
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
    isViewingResume,
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,

    filterChange,
    handleStatusToggle,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobApplication,
    clearAllFilters,
    hasActiveFilters,
    selectedStatuses,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
