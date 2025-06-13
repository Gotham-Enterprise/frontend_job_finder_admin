import { useQuery } from '@tanstack/react-query';
import { companySearchApi } from '../api/companySearch';
import { CompanySearchFilters } from '../types/companySearch';

export const companySearchQueryKeys = {
  all: ['companySearch'] as const,
  lists: () => [...companySearchQueryKeys.all, 'list'] as const,
  list: (filters: CompanySearchFilters) => [...companySearchQueryKeys.lists(), filters] as const,
};

export const useCompanySearch = (filters: CompanySearchFilters = {}) => {
  return useQuery({
    queryKey: companySearchQueryKeys.list(filters),
    queryFn: () => companySearchApi.searchCompanies(filters),
    enabled: !!filters.search,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      console.error('Error searching companies:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
