import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { legalDocumentsApi } from '../api/legalDocuments';
import {
  CreateLegalDocumentVersionPayload,
  LegalDocumentListFilters,
  LegalDocumentType,
} from '../types/legalDocuments';
import { showToast } from '../utils/toast';

export const legalDocumentsQueryKeys = {
  all: ['legal-documents'] as const,
  lists: () => [...legalDocumentsQueryKeys.all, 'list'] as const,
  list: (type: LegalDocumentType, filters: LegalDocumentListFilters) =>
    [...legalDocumentsQueryKeys.lists(), type, JSON.stringify(filters)] as const,
  latest: (type: LegalDocumentType) =>
    [...legalDocumentsQueryKeys.all, 'latest', type] as const,
  detail: (type: LegalDocumentType, id: number) =>
    [...legalDocumentsQueryKeys.all, 'detail', type, id] as const,
};

export const useLegalDocumentVersions = (
  type: LegalDocumentType,
  filters: LegalDocumentListFilters = {},
) => {
  return useQuery({
    queryKey: legalDocumentsQueryKeys.list(type, filters),
    queryFn: () => legalDocumentsApi.listVersions(type, filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useLatestLegalDocumentVersion = (type: LegalDocumentType, enabled = true) => {
  return useQuery({
    queryKey: legalDocumentsQueryKeys.latest(type),
    queryFn: () => legalDocumentsApi.getLatestVersion(type),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useLegalDocumentVersion = (
  type: LegalDocumentType,
  id: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: legalDocumentsQueryKeys.detail(type, id),
    queryFn: () => legalDocumentsApi.getVersionById(type, id),
    enabled: enabled && Number.isFinite(id) && id > 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateLegalDocumentVersion = (type: LegalDocumentType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLegalDocumentVersionPayload) =>
      legalDocumentsApi.createVersion(type, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: legalDocumentsQueryKeys.all });
      showToast.success(
        'Version Created',
        response.message || 'The new version is now live on the site.',
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create version. Please try again.';
      showToast.error('Creation Failed', errorMessage);
    },
  });
};
