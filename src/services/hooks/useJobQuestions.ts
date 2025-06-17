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
    retry: false, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
