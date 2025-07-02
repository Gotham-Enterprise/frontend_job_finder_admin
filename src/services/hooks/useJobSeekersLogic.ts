import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobSeekers, useViewResume } from '@/services/hooks/useJobSeekers';
import { useOccupations } from '@/services/hooks/useOccupations';
import { useStates } from '@/services/hooks/useStates';
import { JobSeekerFilters } from '@/services/types/jobSeeker';

export const useJobSeekersLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<JobSeekerFilters>({
    page: 1,
    limit: 10,
    search: '',
    location: '',
    occupationId: undefined,
    status: undefined,
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error, refetch } = useJobSeekers(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewResume();
  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'specialties', label: 'Occupation' },
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
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  const filterChange = useMemo(() => (key: keyof JobSeekerFilters, value: any) => {
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
    switch (status) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      case 'pending': return 'light';
      default: return 'light';
    }
  }, []);

  const initViewResume = async (resumeId: string | null) => {
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
  };
  const viewJobSeeker = (jobSeekerId: string) => {
    router.push(`/admin/job-seekers/details/${jobSeekerId}`);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 10,
        search: '',
        location: '',
        occupationId: undefined,
        status: undefined,
      });
      setSearchInput('');
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.occupationId ||
      filters.status
    );
  }, [searchInput, filters.location, filters.occupationId, filters.status]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
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
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobSeeker,
    clearAllFilters,
    hasActiveFilters,
  };
};
