import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEmployers } from '@/services/hooks/useEmployers';
import { useEmployerStates } from '@/services/hooks/useEmployerStates';
import { EmployerFilters } from '@/services/types/employer';

export const useEmployerLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initializeFilters = (): EmployerFilters => {
    const urlPage = searchParams.get('page');
    const urlLimit = searchParams.get('limit');
    const urlName = searchParams.get('name');
    const urlLocation = searchParams.get('location');
    const urlStatus = searchParams.get('status');
    
    return {
      page: urlPage ? parseInt(urlPage) : 1,
      limit: urlLimit ? parseInt(urlLimit) : 100,
      name: urlName || '',
      location: urlLocation || '',
      status: urlStatus || undefined,
    };
  };

  const [filters, setFilters] = useState<EmployerFilters>(initializeFilters);
  const [searchInput, setSearchInput] = useState(filters.name || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.status ? [filters.status] : []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    
    if ((filters.page ?? 1) > 1) params.set('page', (filters.page ?? 1).toString());
    if ((filters.limit ?? 100) !== 100) params.set('limit', (filters.limit ?? 100).toString());
    if (filters.name) params.set('name', filters.name);
    if (filters.location) params.set('location', filters.location);
    if (filters.status) params.set('status', filters.status);
    
    const queryString = params.toString();
    const newUrl = `/admin/employers${queryString ? `?${queryString}` : ''}`;
    
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    const state = {
      filters,
      searchInput,
      selectedEmployerId,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('employerListState', JSON.stringify(state));
  }, [filters, searchInput, selectedEmployerId]);

  useEffect(() => {
    const savedState = localStorage.getItem('employerListState');
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
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
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

  const statusToggle = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    startTransition(() => {
      const status = statuses.length > 0 ? statuses[0] : undefined;
      setFilters(prev => ({ ...prev, status, page: 1 }));
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
  const viewEmployer = (employerId: string) => {
    const state = {
      filters,
      searchInput,
      selectedEmployerId,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('employerListState', JSON.stringify(state));
    
    router.push(`/admin/employers/details/${employerId}`);
  };
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
  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 100,
        name: '',
        location: '',
        status: undefined,
      });
      setSearchInput('');
      setSelectedEmployerId(null);
      setSelectedStatuses([]);
    });
  };
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.status ||
      selectedEmployerId ||
      selectedStatuses.length > 0
    );
  }, [searchInput, filters.location, filters.status, selectedEmployerId, selectedStatuses]);

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
    statusToggle,
    initPageChange,
    getStatusVariant,
    viewEmployer,
    viewSubscription,    
    selectedEmployerId,
    employerSelect,
    onCreateJob,
    isCreatingJob,
    clearAllFilters,
    hasActiveFilters,
    selectedStatuses,
  };
};
