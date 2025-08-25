import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JobData } from '@/services/types/CareersTypes';

export const useCareersLogic = () => {
  const router = useRouter();
  const [activeJobs, setActiveJobs] = useState<JobData[]>([]);
  const [closedJobs, setClosedJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Just a simulation For now
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Just a simulation For now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for now
      const mockActiveJobs: JobData[] = [
        {
          id: '1',
          title: 'Customer Service Support Representative',
          pay: '20',
          payPeriod: 'Hour',
          type: 'Full time',
          location: 'Riverside, California',
          applicantCount: 20,
          postedDate: 'few hours ago',
          status: 'active'
        }
      ];

      const mockClosedJobs: JobData[] = [
        {
          id: '2',
          title: 'Customer Service Support Representative',
          pay: '20',
          payPeriod: 'Hour',
          type: 'Full time',
          location: 'Riverside, California',
          applicantCount: 20,
          postedDate: 'few hours ago',
          status: 'closed'
        }
      ];
      
      //TODO: API call
      setActiveJobs(mockActiveJobs);
      setClosedJobs(mockClosedJobs);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refetch = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = useCallback(() => {
    router.push('/admin/jobs/create');
  }, [router]);

  const viewJobDetails = useCallback((jobId: string) => {
    router.push(`/admin/jobs/${jobId}`);
  }, [router]);

  const editJob = useCallback((jobId: string) => {
    router.push(`/admin/jobs/${jobId}/edit`);
  }, [router]);


  //TODO: Deleting a job post
  const deleteJob = useCallback(async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        console.log('Deleting job:', jobId);
        await fetchJobs();
      } catch (err) {
        setError(err as Error);
      }
    }
  }, [fetchJobs]);

  const viewApplicants = useCallback((jobId: string) => {
    router.push(`/admin/jobs/${jobId}/applicants`);
  }, [router]);

  return {
    activeJobs,
    closedJobs,
    isLoading,
    error,
    refetch,
    createJob,
    viewJobDetails,
    editJob,
    deleteJob,
    viewApplicants,
  };
};
