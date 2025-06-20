import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobsAdmin, useJobsAdminOccupations } from '@/services/hooks/useJobsAdmin';
import { useStates } from '@/services/hooks/useStates';
import { JobsAdminFilters, Specialty } from '@/services/types/jobsAdmin';

export const useJobsAdminLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<JobsAdminFilters>({
    page: 1,
    limit: 10,
    name: '',
    state: '',
    jobStatus: undefined,
    datePosted: '',
    occupationId: undefined,
    specialtyId: undefined,
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(undefined);

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
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  const filterChange = useMemo(() => (key: keyof JobsAdminFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value === '' ? undefined : value,
        page: 1,
        ...(key === 'occupationId' && { specialtyId: undefined })
      }));
      if (key === 'occupationId') {
        setSelectedOccupationId(value === '' ? undefined : parseInt(value));
      }
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
    router.push(`/admin/jobs/details/${jobId}`);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 10,
        name: '',
        state: '',
        jobStatus: undefined,
        datePosted: '',
        occupationId: undefined,
        specialtyId: undefined,
      });
      setSearchInput('');
      setSelectedOccupationId(undefined);
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.state ||
      filters.jobStatus ||
      filters.datePosted ||
      filters.occupationId ||
      filters.specialtyId
    );
  }, [searchInput, filters.state, filters.jobStatus, filters.datePosted, filters.occupationId, filters.specialtyId]);

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
    initPageChange,
    getStatusVariant,
    getJobStatusVariant,
    viewJobDetails,
    clearAllFilters,
    hasActiveFilters,
  };
};
