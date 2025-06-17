import { useMutation } from '@tanstack/react-query';
import {JobPostingPayload} from '@/services/types/jobCreation';
import { jobPostingApi } from '@/services/api/jobPosting';


export const useCreateJobPost = () => {
  return useMutation({
    mutationFn: ({ companyId, payload }: { companyId: string; payload: Omit<JobPostingPayload, 'companyId'> }) =>
      jobPostingApi.createJobPost(companyId, payload),
    onSuccess: (data) => {
      console.log('✅ Job posted successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Error posting job:', error);
    },
  });
};
