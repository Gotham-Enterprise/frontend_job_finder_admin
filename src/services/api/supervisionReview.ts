import {
  SupervisionReviewFilters,
  SupervisionReviewsResponse,
  SupervisionReviewDetailResponse,
  SupervisionReviewDeleteResponse,
} from "../types/supervisionReview";
import { apiGet, apiDelete } from "./apiUtils";
import { showToast } from "../utils/toast";

export const supervisionReviewApi = {
  async getReviews(
    filters: SupervisionReviewFilters = {},
  ): Promise<SupervisionReviewsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.supervisorId)
        queryParams.append("supervisorId", filters.supervisorId);
      if (filters.superviseeId)
        queryParams.append("superviseeId", filters.superviseeId);
      if (filters.minRating)
        queryParams.append("minRating", filters.minRating.toString());
      if (filters.maxRating)
        queryParams.append("maxRating", filters.maxRating.toString());

      const endpoint = `/api/supervision/admin/reviews?${queryParams.toString()}`;
      return apiGet<SupervisionReviewsResponse>(endpoint);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast.error("Reviews Error", errorMessage);
      throw error;
    }
  },

  async getReviewById(id: string): Promise<SupervisionReviewDetailResponse> {
    return apiGet<SupervisionReviewDetailResponse>(
      `/api/supervision/admin/reviews/${id}`,
    );
  },

  async deleteReview(id: string): Promise<SupervisionReviewDeleteResponse> {
    return apiDelete<SupervisionReviewDeleteResponse>(
      `/api/supervision/admin/reviews/${id}`,
    );
  },
};
