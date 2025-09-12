import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCareers, useDeleteCareer, useCreateCareer } from './useCareers';
import type { Career, CareerTableData, CareerFilters } from '@/services/types/CareersTypes';

export const useCareersLogic = () => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<CareerFilters>({
  limit: 5,
    page: 1,
    keywords: '',
    isActive: true,
  });
  const [closedFilters, setClosedFilters] = useState<CareerFilters>({
  limit: 5,
    page: 1,
    keywords: '',
    isActive: false,
  });

  const { data: activeResponse, isLoading: loadingActive, error: errorActive, refetch: refetchActive } = useCareers(activeFilters);
  const { data: closedResponse, isLoading: loadingClosed, error: errorClosed, refetch: refetchClosed } = useCareers(closedFilters);

  // Mutation hooks, DELETE and CREATE
  const deleteCareerMutation = useDeleteCareer();
  const createCareerMutation = useCreateCareer();

  const { activeJobs, closedJobs } = useMemo(() => {
    const activeList = Array.isArray(activeResponse?.data) ? (activeResponse!.data as any[]) : [];
    const closedList = Array.isArray(closedResponse?.data) ? (closedResponse!.data as any[]) : [];

    const transformCareer = (career: any): CareerTableData => {
      const rawStart = Number(career.salaryRangeStart) || 0;
      const rawEnd = Number(career.salaryRangeEnd) || 0;
      const hasRange = rawStart > 0 && rawEnd > 0;
      return {
        id: career.id,
        title: career.jobTitle,
        // Always leave pay empty so UI chooses best salary presentation
        pay: '',
        payPeriod: '',
        type: career.jobType,
        location: `${career.city}, ${career.state}`,
        applicantCount: career.applicantsCount ?? (career.applicants ? career.applicants.length : 0),
        postedDate: formatPostedDate(career.createdAt),
        status: career.isActive ? 'active' : 'closed' as 'active' | 'closed' | 'draft',
        salaryRangeStart: rawStart > 0 ? rawStart : undefined,
        salaryRangeEnd: rawEnd > 0 ? rawEnd : undefined,
        salaryRange: hasRange ? (career.salaryRange || `${rawStart}-${rawEnd}`) : undefined,
  createdAtISO: career.createdAt,
  createdAtTs: Date.parse(career.createdAt),
      };
    };

    const active = activeList.map(transformCareer)
      .sort((a: CareerTableData, b: CareerTableData) => (b.createdAtTs || 0) - (a.createdAtTs || 0));
    const closed = closedList.map(transformCareer)
      .sort((a: CareerTableData, b: CareerTableData) => (b.createdAtTs || 0) - (a.createdAtTs || 0));

    return { activeJobs: active, closedJobs: closed };
  }, [activeResponse, closedResponse]);


  // Open modal instead of navigating to a new page
  const createJob = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const viewJobDetails = useCallback((jobId: string) => {
    router.push(`/admin/careers/job-details/${jobId}`);
  }, [router]);

  const editJob = useCallback((jobId: string) => {
    router.push(`/admin/careers/${jobId}/edit`);
  }, [router]);

  const deleteJob = useCallback(async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteCareerMutation.mutateAsync(jobId);
        //TODO: after deleting make 
        // Call to invalidate cached data...
      } catch (err) {
        console.error('Failed to delete job:', err);
        // Error handling is done in the mutation hook
      }
    }
  }, [deleteCareerMutation]);

  const viewApplicants = useCallback((jobId: string) => {
    router.push(`/admin/careers/job-details/${jobId}`);
  }, [router]);

  const isLoadingState = loadingActive || loadingClosed || deleteCareerMutation.isPending || createCareerMutation.isPending;

  const onSearch = useCallback((q: string) => {
    setActiveFilters((prev) => ({ ...prev, keywords: q, page: 1 }));
    setClosedFilters((prev) => ({ ...prev, keywords: q, page: 1 }));
  }, []);

  const onPageSizeChange = useCallback((size: number) => {
    // clamp
    const next = Math.max(1, Math.min(100, size));
    setActiveFilters((prev) => ({ ...prev, limit: next, page: 1 }));
    setClosedFilters((prev) => ({ ...prev, limit: next, page: 1 }));
  }, []);

  const nextActivePage = useCallback(() => {
    if (activeResponse?.metaData?.hasNextPage) {
      setActiveFilters((p) => ({ ...p, page: (p.page || 1) + 1 }));
    }
  }, [activeResponse]);
  const prevActivePage = useCallback(() => {
    if (activeResponse?.metaData?.hasPreviousPage) {
      setActiveFilters((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }));
    }
  }, [activeResponse]);

  const nextClosedPage = useCallback(() => {
    if (closedResponse?.metaData?.hasNextPage) {
      setClosedFilters((p) => ({ ...p, page: (p.page || 1) + 1 }));
    }
  }, [closedResponse]);
  const prevClosedPage = useCallback(() => {
    if (closedResponse?.metaData?.hasPreviousPage) {
      setClosedFilters((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }));
    }
  }, [closedResponse]);

  return {
    activeJobs,
    closedJobs,
    isLoading: isLoadingState,
  error: errorActive || errorClosed,
  refetch: () => { refetchActive(); refetchClosed(); },
    createJob,
    isCreateModalOpen,
    closeCreateModal,
    viewJobDetails,
    editJob,
    deleteJob,
    viewApplicants,
    onSearch,
  onPageSizeChange,
  // pagination controls and meta
  activeMeta: activeResponse?.metaData,
  closedMeta: closedResponse?.metaData,
  nextActivePage,
  prevActivePage,
  nextClosedPage,
  prevClosedPage,
    // Additional state for UI feedback
    isDeleting: deleteCareerMutation.isPending,
    isCreating: createCareerMutation.isPending,
    // Expose metadata for pagination if needed
  metaData: undefined,
  };
};

// Helper function to format posted date
function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'few minutes ago';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
