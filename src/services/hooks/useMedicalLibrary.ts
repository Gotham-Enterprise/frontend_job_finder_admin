import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalLibraryApi, MedicalLibraryFilters, MedicalLibraryCreateData } from "../api/medicalLibrary";

export const medicalLibraryQueryKeys = {
  all: ["medical-library"] as const,
  lists: () => [...medicalLibraryQueryKeys.all, "list"] as const,
  list: (filters: MedicalLibraryFilters) => [...medicalLibraryQueryKeys.lists(), filters] as const,
  details: () => [...medicalLibraryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalLibraryQueryKeys.details(), id] as const,
};

export const useMedicalLibraryTopics = (filters: MedicalLibraryFilters = {}) => {
  return useQuery({
    queryKey: medicalLibraryQueryKeys.list(filters),
    queryFn: () => medicalLibraryApi.getTopics(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMedicalLibraryTopicById = (id: string) => {
  return useQuery({
    queryKey: medicalLibraryQueryKeys.detail(id),
    queryFn: () => medicalLibraryApi.getTopicById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateMedicalLibraryTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MedicalLibraryCreateData) => medicalLibraryApi.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryQueryKeys.lists() });
    },
  });
};

export const useUpdateMedicalLibraryTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalLibraryCreateData> }) =>
      medicalLibraryApi.updateTopic(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicalLibraryQueryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteMedicalLibraryTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalLibraryApi.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryQueryKeys.lists() });
    },
  });
};
