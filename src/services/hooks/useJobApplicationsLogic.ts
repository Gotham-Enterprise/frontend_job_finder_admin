import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobApplications, useViewApplicationResume } from '@/services/hooks/useJobApplications';
import { useStates } from '@/services/hooks/useStates';
import { JobApplicationFilters } from '@/services/types/jobApplication';

export const useJobApplicationsLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobApplicationFilters => {
    const nameParam = searchParams.get('name') || '';
    const decodedName = nameParam ? decodeURIComponent(nameParam) : '';
    
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
      name: decodedName,
      location: searchParams.get('location') || '',
      companyName: searchParams.get('companyName') || '',
      status: searchParams.get('status') || '',
    };
  };

  const [filters, setFilters] = useState<JobApplicationFilters>(getInitialFilters);
  const [searchInput, setSearchInput] = useState(() => {
    const nameParam = searchParams.get('name') || '';
    return nameParam ? decodeURIComponent(nameParam) : '';
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error, refetch } = useJobApplications(filters);
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewApplicationResume();

  // Save state to localStorage for preservation
  useEffect(() => {
    const state = {
      filters,
      searchInput,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('jobApplicationsListState', JSON.stringify(state));
  }, [filters, searchInput]);

  // Restore scroll position from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('jobApplicationsListState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.scrollPosition) {
          // Restore scroll position after a brief delay to ensure content is loaded
          setTimeout(() => {
            window.scrollTo({ top: parsed.scrollPosition, behavior: 'instant' });
          }, 100);
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
      }
    }
  }, []);

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
    { value: '', label: 'All Statuses' },
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

  const viewJobApplication = (jobApplicationId: string) => {
    // Save current state and scroll position before navigation
    const state = {
      filters,
      searchInput,
      scrollPosition: window.scrollY,
    };
    localStorage.setItem('jobApplicationsListState', JSON.stringify(state));
    
    router.push(`/admin/applications/details/${jobApplicationId}`);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 50,
        name: '',
        location: '',
        companyName: '',
        status: '',
      });
      setSearchInput('');
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.location ||
      filters.companyName ||
      filters.status
    );
  }, [searchInput, filters.location, filters.companyName, filters.status]);

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
    isViewingResume,
    
    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,

    filterChange,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobApplication,
    clearAllFilters,
    hasActiveFilters,
  };
};
