import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobApplications, useViewApplicationResume } from '@/services/hooks/useJobApplications';
import { useStates } from '@/services/hooks/useStates';
import { JobApplicationFilters } from '@/services/types/jobApplication';

export const useJobApplicationsLogic = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<JobApplicationFilters>({
    page: 1,
    limit: 10,
    name: '',
    location: '',
    companyName: '',
    status: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error, refetch } = useJobApplications(filters);
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewApplicationResume();

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
    { value: '5', label: '5 per page' },
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

  const initViewResume = async (resumeUrl: string) => {
    if (!resumeUrl) {
      console.error('No resume URL provided');
      return;
    }
    
    viewResume(resumeUrl, {
      onSuccess: (data: any) => {
        if (data?.success && data?.data?.fileUrl) {
          window.open(data.data.fileUrl, '_blank', 'noopener,noreferrer');
        } else {
          // If the URL is already a direct link, open it directly
          window.open(resumeUrl, '_blank', 'noopener,noreferrer');
        }
      },
      onError: (error) => {
        console.error('Error viewing resume:', error);
        // Fallback: try to open the URL directly
        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      }
    });
  };

  const viewJobApplication = (jobApplicationId: string) => {
    router.push(`/admin/applications/details/${jobApplicationId}`);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setFilters({
        page: 1,
        limit: 10,
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
