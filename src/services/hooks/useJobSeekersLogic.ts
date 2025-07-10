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
    const searchParam = searchParams.get('search') || '';
    const decodedSearch = searchParam ? decodeURIComponent(searchParam) : '';
    const statusParam = searchParams.get('status');
    const validStatus = statusParam && ['active', 'inactive', 'pending', 'suspended'].includes(statusParam) 
      ? statusParam as 'active' | 'inactive' | 'pending' | 'suspended' 
      : undefined;
    
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '100', 10),
      search: decodedSearch,
      location: searchParams.get('location') || '',
      occupationId: searchParams.get('occupationId') ? parseInt(searchParams.get('occupationId')!, 10) : undefined,
      status: validStatus,
    };
  };

  const [filters, setFilters] = useState<JobSeekerFilters>(getInitialFilters);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.status ? [filters.status] : []
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateURL = useCallback((newFilters: JobSeekerFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());
    if (newFilters.limit && newFilters.limit !== 100) params.set('limit', newFilters.limit.toString());
    if (newFilters.search) params.set('search', encodeURIComponent(newFilters.search));
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.occupationId) params.set('occupationId', newFilters.occupationId.toString());
    if (newFilters.status) params.set('status', newFilters.status);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/admin/job-seekers${newURL}`, { scroll: false });
  }, [router]);

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

  const filterChange = useMemo(() => (key: keyof JobSeekerFilters, value: any) => {
    startTransition(() => {
      const newFilters = { 
        ...filters, 
        [key]: value === '' ? undefined : value,
        page: 1
      };
      setFilters(newFilters);
      updateURL(newFilters);
    });
  }, [filters, updateURL]);

  const statusToggleChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    startTransition(() => {
      // For now, we'll use the first selected status for the API call
      // Later you might want to update the API to handle multiple statuses
      const newFilters = { 
        ...filters, 
        status: statuses.length > 0 ? statuses[0] as any : undefined,
        page: 1
      };
      setFilters(newFilters);
      updateURL(newFilters);
    });
  }, [filters, updateURL]);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      updateURL(newFilters);
    });
  }, [filters, updateURL]);
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
    startTransition(() => {
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
      updateURL(newFilters);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jobseeker-scroll-position');
      }
    });
  }, [startTransition, updateURL]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.occupationId ||
      selectedStatuses.length > 0
    );
  }, [searchInput, filters.location, filters.occupationId, selectedStatuses.length]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        const newFilters = { ...filters, search: searchInput, page: 1 };
        setFilters(newFilters);
        updateURL(newFilters);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (data && !isLoading && searchParams.toString()) {
      restoreScrollPosition();
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
