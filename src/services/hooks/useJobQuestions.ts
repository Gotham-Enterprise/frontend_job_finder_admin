import { useQuery } from '@tanstack/react-query';
import { jobQuestionsApi } from '../api/jobQuestions';

export const jobQuestionQueryKeys = {
  all: ['job-questions'] as const,
  commonQuestions: () => [...jobQuestionQueryKeys.all, 'common'] as const,
};

export const useCommonQuestions = () => {
  return useQuery({
    queryKey: jobQuestionQueryKeys.commonQuestions(),
    queryFn: () => jobQuestionsApi.getCommonQuestions(),
    staleTime: 1000 * 60 * 30, 
    retry: 3, 
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true, 
    refetchOnReconnect: true, 
  });
};
