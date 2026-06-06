import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supervisionReviewApi } from "../api/supervisionReview";
import { SupervisionReviewFilters } from "../types/supervisionReview";
import { showToast } from "../utils/toast";

export const supervisionReviewQueryKeys = {
  all: ["supervisionReviews"] as const,
  lists: () => [...supervisionReviewQueryKeys.all, "list"] as const,
  list: (filters: SupervisionReviewFilters) =>
    [...supervisionReviewQueryKeys.lists(), filters] as const,
  details: () => [...supervisionReviewQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...supervisionReviewQueryKeys.details(), id] as const,
};

export const useSupervisionReviews = (
  filters: SupervisionReviewFilters = {},
) => {
  return useQuery({
    queryKey: supervisionReviewQueryKeys.list(filters),
    queryFn: () => supervisionReviewApi.getReviews(filters),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSupervisionReviewDetails = (id: string) => {
  return useQuery({
    queryKey: supervisionReviewQueryKeys.detail(id),
    queryFn: () => supervisionReviewApi.getReviewById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useDeleteSupervisionReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supervisionReviewApi.deleteReview(id),
    onSuccess: () => {
      showToast.success(
        "Review Deleted",
        "The review has been removed successfully.",
      );
      queryClient.invalidateQueries({
        queryKey: supervisionReviewQueryKeys.lists(),
      });
    },
    onError: (error: Error) => {
      showToast.error(
        "Delete Failed",
        error.message || "Failed to delete review. Please try again.",
      );
    },
  });
};
