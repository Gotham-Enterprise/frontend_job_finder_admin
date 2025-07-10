import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobsAdmin, useJobsAdminOccupations } from '@/services/hooks/useJobsAdmin';
import { useStates } from '@/services/hooks/useStates';
import { JobsAdminFilters, Specialty } from '@/services/types/jobsAdmin';

export const useJobsAdminLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initializeFilters = (): JobsAdminFilters => {
    const urlPage = searchParams.get('page');
    const urlLimit = searchParams.get('limit');
    const urlName = searchParams.get('name');
    const urlState = searchParams.get('state');
    const urlJobStatus = searchParams.get('jobStatus');
    const urlDatePosted = searchParams.get('datePosted');
    const urlOccupationId = searchParams.get('occupationId');
    const urlSpecialtyId = searchParams.get('specialtyId');
    
    return {
      page: urlPage ? parseInt(urlPage) : 1,
      limit: urlLimit ? parseInt(urlLimit) : 100,
      name: urlName || '',
      state: urlState || '',
      jobStatus: (urlJobStatus === 'Draft' || urlJobStatus === 'Published') ? urlJobStatus : undefined,
      datePosted: urlDatePosted || '',
      occupationId: urlOccupationId ? parseInt(urlOccupationId) : undefined,
      specialtyId: urlSpecialtyId ? parseInt(urlSpecialtyId) : undefined,
    };
  };

  const [filters, setFilters] = useState<JobsAdminFilters>(initializeFilters);
  const [searchInput, setSearchInput] = useState(filters.name || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(filters.occupationId);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>(
    filters.jobStatus ? [filters.jobStatus] : []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    
    if ((filters.page ?? 1) > 1) params.set('page', (filters.page ?? 1).toString());
    if ((filters.limit ?? 100) !== 100) params.set('limit', (filters.limit ?? 100).toString());
    if (filters.name) params.set('name', filters.name);
    if (filters.state) params.set('state', filters.state);
    if (filters.jobStatus) params.set('jobStatus', filters.jobStatus);
    if (filters.datePosted) params.set('datePosted', filters.datePosted);
    if (filters.occupationId) params.set('occupationId', filters.occupationId.toString());
    if (filters.specialtyId) params.set('specialtyId', filters.specialtyId.toString());
    
    const queryString = params.toString();
    const newUrl = `/admin/jobs${queryString ? `?${queryString}` : ''}`;
    
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    const state = {
      filters,
      searchInput,
      selectedOccupationId,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('jobsAdminListState', JSON.stringify(state));
  }, [filters, searchInput, selectedOccupationId]);

  useEffect(() => {
    const savedState = localStorage.getItem('jobsAdminListState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.scrollPosition) {
          setTimeout(() => {
            window.scrollTo({ top: parsed.scrollPosition, behavior: 'instant' });
          }, 100);
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
      }
    }
  }, []);

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

  const viewJobDetails = (jobId: string) => {
    const state = {
      filters,
      searchInput,
      selectedOccupationId,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('jobsAdminListState', JSON.stringify(state));
    
    router.push(`/admin/jobs/details/${jobId}`);
  };

  const editJobPost = (jobId: string) => {
    router.push(`/admin/jobs/edit-job?id=${jobId}`);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 100,
        name: '',
        state: '',
        jobStatus: undefined,
        datePosted: '',
        occupationId: undefined,
        specialtyId: undefined,
      });
      setSearchInput('');
      setSelectedOccupationId(undefined);
      setSelectedJobStatuses([]);
    });
  };

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
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, name: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

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
  };
};
