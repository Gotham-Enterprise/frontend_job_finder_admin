import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSurveyJobs,
  createSurveyJob,
  updateSurveyJob,
  toggleSurveyJob,
  deleteSurveyJob,
  CreateSurveyJobData,
  UpdateSurveyJobData,
  SurveyJobSortBy,
} from "../api/surveyJobs";
import { showToast } from "../utils/toast";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const surveyJobQueryKeys = {
  all: ["surveyJobs"] as const,
  list: (filters?: object) => [...surveyJobQueryKeys.all, "list", filters ?? {}] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export interface SurveyJobsParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  search?: string;
  locationState?: string;
  locationCity?: string;
  affiliatePartnerId?: string;
  sortBy?: SurveyJobSortBy;
}

export const useSurveyJobs = (params?: SurveyJobsParams) => {
  return useQuery({
    queryKey: surveyJobQueryKeys.list(params),
    queryFn: () => getSurveyJobs(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
};

export const useCreateSurveyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyJobData) => createSurveyJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyJobQueryKeys.all });
      showToast.success("Success", "Survey job created successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to create survey job");
    },
  });
};

export const useUpdateSurveyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyJobData }) => updateSurveyJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyJobQueryKeys.all });
      showToast.success("Success", "Survey job updated successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to update survey job");
    },
  });
};

export const useToggleSurveyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => toggleSurveyJob(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyJobQueryKeys.all });
      showToast.success("Success", `Survey job ${variables.isPublished ? "published" : "unpublished"} successfully`);
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to update survey job status");
    },
  });
};

export const useDeleteSurveyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSurveyJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyJobQueryKeys.all });
      showToast.success("Success", "Survey job deleted successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to delete survey job");
    },
  });
};
