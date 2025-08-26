import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCareers, useDeleteCareer, useCreateCareer } from './useCareers';
import type { Career, CareerTableData } from '@/services/types/CareersTypes';

export const useCareersLogic = () => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: careersResponse, isLoading, error, refetch } = useCareers({
    limit: 100, // Check if we really need this limit as static
    page: 1,
  });

  // Mutation hooks, DELETE and CREATE
  const deleteCareerMutation = useDeleteCareer();
  const createCareerMutation = useCreateCareer();

  const { activeJobs, closedJobs } = useMemo(() => {
    if (!careersResponse?.data) {
      return { activeJobs: [], closedJobs: [] };
    }
    
    // Since Backend returns grouped structure: { active: [...], inactive: [...] }
    const groupedCareers = careersResponse.data as any;
    
    const transformCareer = (career: any): CareerTableData => ({
      id: career.id,
      title: career.jobTitle,
      pay: 'Not specified', // TODO: Check if we really want this that the API is not returning pay
      payPeriod: 'Hour',
      type: career.jobType,
      location: `${career.city}, ${career.state}`,
      applicantCount: career.applicantsCount,
      postedDate: formatPostedDate(career.createdAt),
      status: career.isActive ? 'active' : 'closed' as 'active' | 'closed' | 'draft',
    });

    // Handle grouped response structure: { active: [...], inactive: [...] }
    const active = (groupedCareers.active || []).map(transformCareer);
    const closed = (groupedCareers.inactive || []).map(transformCareer);

    return { activeJobs: active, closedJobs: closed };
  }, [careersResponse]);


  // Open modal instead of navigating to a new page
  const createJob = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const viewJobDetails = useCallback((jobId: string) => {
    router.push(`/admin/careers/${jobId}`);
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
    router.push(`/admin/careers/${jobId}/applicants`);
  }, [router]);

  const isLoadingState = isLoading || deleteCareerMutation.isPending || createCareerMutation.isPending;

  return {
    activeJobs,
    closedJobs,
    isLoading: isLoadingState,
    error,
    refetch,
    createJob,
    isCreateModalOpen,
    closeCreateModal,
    viewJobDetails,
    editJob,
    deleteJob,
    viewApplicants,
    // Additional state for UI feedback
    isDeleting: deleteCareerMutation.isPending,
    isCreating: createCareerMutation.isPending,
    // Expose metadata for pagination if needed
    metaData: careersResponse?.metaData,
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
