import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployers } from '@/services/hooks/useEmployers';
import { useEmployerStates } from '@/services/hooks/useEmployerStates';
import { EmployerFilters } from '@/services/types/employer';

export const useEmployerLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<EmployerFilters>({
    page: 1,
    limit: 10,
    name: '',
    location: '',
    status: undefined,
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useEmployers(filters);
  const { data: statesData, isLoading: isStatesLoading } = useEmployerStates();  const tableColumns = useMemo(() => [
    { key: 'select', label: '', className: 'w-16' },
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'state', label: 'States' },
    { key: 'jobPostCount', label: 'Job Posts' },
    { key: 'dateJoined', label: 'Date Joined' },
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
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
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
  const viewEmployer = (employerId: string) => {
    router.push(`/admin/employers/details/${employerId}`);
  };
  const viewSubscription = (employerId: string) => {
    router.push(`/admin/subscriptions?employerId=${employerId}`);
  };

  const employerSelect = (employerId: string, isSelected: boolean) => {
    setSelectedEmployerId(isSelected ? employerId : null);
  };

  const onCreateJob = () => {
    if (selectedEmployerId) {
      router.push(`/admin/jobs/create-job?id=${selectedEmployerId}`);
    }
  };

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
    initPageChange,
    getStatusVariant,
    viewEmployer,
    viewSubscription,

    selectedEmployerId,
    employerSelect,
    onCreateJob,
  };
};
