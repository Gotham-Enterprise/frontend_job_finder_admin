import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careersApi, CareerFilters, CreateCareerPayload, UpdateCareerPayload } from '../api/careers';
import { showToast } from '../utils/toast';

// Query keys for React Query cache management
export const careersQueryKeys = {
  all: ['careers'] as const,
  lists: () => [...careersQueryKeys.all, 'list'] as const,
  list: (filters: CareerFilters) => {
    const serializedFilters = JSON.stringify(filters, Object.keys(filters || {}).sort());
    return [...careersQueryKeys.lists(), serializedFilters] as const;
  },
  details: () => [...careersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...careersQueryKeys.details(), id] as const,
  applicants: (id: string) => [...careersQueryKeys.all, 'applicants', id] as const,
  dropdowns: () => [...careersQueryKeys.all, 'dropdowns'] as const,
  departments: () => [...careersQueryKeys.dropdowns(), 'departments'] as const,
  locations: () => [...careersQueryKeys.dropdowns(), 'locations'] as const,
  jobTypes: () => [...careersQueryKeys.dropdowns(), 'jobTypes'] as const,
  workPlaceTypes: () => [...careersQueryKeys.dropdowns(), 'workPlaceTypes'] as const,
};

// Query hooks
export const useCareers = (filters: CareerFilters = {}) => {
  return useQuery({
    queryKey: careersQueryKeys.list(filters),
    queryFn: async () => {
      try {
        const result = await careersApi.getCareers(filters);
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      if (error.message.includes('HTTP 500')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};

export const useCareerDetails = (id: string, page: number = 1, limit: number = 10, keywords: string = '') => {
  return useQuery({
    queryKey: careersQueryKeys.detail(id),
    queryFn: () => careersApi.getCareerById(id, page, limit, keywords),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Dropdown options hooks
export const useDepartments = () => {
  return useQuery({
    queryKey: careersQueryKeys.departments(),
    queryFn: () => careersApi.getDepartments(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: careersQueryKeys.locations(),
    queryFn: () => careersApi.getLocations(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useJobTypes = () => {
  return useQuery({
    queryKey: careersQueryKeys.jobTypes(),
    queryFn: () => careersApi.getJobTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useWorkPlaceTypes = () => {
  return useQuery({
    queryKey: careersQueryKeys.workPlaceTypes(),
    queryFn: () => careersApi.getWorkPlaceTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Mutation hooks
export const useCreateCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCareerPayload) => careersApi.createCareer(payload),
    onSuccess: (data) => {
      // Invalidate and refetch career lists
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      
      showToast.success(
        'Career Created!',
        `Career "${data.data.jobTitle}" has been created successfully.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to create career. Please try again.';
      
      if (error.message === 'Request timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Creation Failed', errorMessage);
    },
  });
};

export const useUpdateCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCareerPayload }) => 
      careersApi.updateCareer(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate career lists and specific career detail
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.detail(variables.id) });
      
      showToast.success(
        'Career Updated!',
        `Career "${data.data.jobTitle}" has been updated successfully.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update career. Please try again.';
      
      if (error.message === 'Request timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Update Failed', errorMessage);
    },
  });
};

export const useDeleteCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careersApi.deleteCareer(id),
    onSuccess: (data, id) => {
      // Invalidate career lists and remove specific career from cache
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      queryClient.removeQueries({ queryKey: careersQueryKeys.detail(id) });
      
      showToast.success(
        'Career Deleted!',
        'Career has been deleted successfully.'
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to delete career. Please try again.';
      
      if (error.message === 'Request timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Deletion Failed', errorMessage);
    },
  });
};

export const useToggleCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careersApi.toggleCareer(id),
    onSuccess: (data, id) => {
      // Invalidate career lists and specific career detail
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.detail(id) });
      
      showToast.success(
        'Career Status Updated!',
        `Career status has been changed to ${data.data.status}.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update career status. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Status Update Failed', errorMessage);
    },
  });
};

export const useDuplicateCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careersApi.duplicateCareer(id),
    onSuccess: (data) => {
      // Invalidate career lists to show the new duplicate
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      
      showToast.success(
        'Career Duplicated!',
        `Career "${data.data.jobTitle}" has been duplicated successfully.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to duplicate career. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Duplication Failed', errorMessage);
    },
  });
};

export const useUpdateCareerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'closed' | 'draft' }) => 
      careersApi.updateCareerStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate career lists and specific career detail
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.detail(variables.id) });
      
      showToast.success(
        'Career Status Updated!',
        `Career status has been changed to ${data.data.status}.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update career status. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Status Update Failed', errorMessage);
    },
  });
};

export const useUpdateApplicantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicantId, status }: { applicantId: string; status: 'PENDING' | 'QUALIFIED' | 'NOT_QUALIFIED' }) => 
      careersApi.updateApplicantStatus(applicantId, status),
    onSuccess: (data, variables) => {
      // Invalidate all career details to refresh applicant data
      queryClient.invalidateQueries({ queryKey: careersQueryKeys.details() });
      
      const statusText = variables.status.toLowerCase().replace('_', ' ');
      showToast.success(
        'Applicant Status Updated!',
        `Applicant status has been changed to ${statusText}.`
      );
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update applicant status. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Status Update Failed', errorMessage);
    },
  });
};
