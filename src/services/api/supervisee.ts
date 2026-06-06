import {
  SuperviseeDetailsResponse,
  SuperviseeFilters,
  SuperviseeUpdatePayload,
  SuperviseeUpdateResponse,
  SuperviseesResponse,
} from "../types/supervisee";
import { apiGet, apiPatch } from "./apiUtils";
import { buildSuperviseeUpdateFormData } from "../utils/superviseeProfileForm";
import { showToast } from "../utils/toast";

export const superviseeApi = {
  async getSupervisees(filters: SuperviseeFilters = {}): Promise<SuperviseesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.keyword) queryParams.append("keyword", filters.keyword);

      const endpoint = `/api/supervision/admin/supervisees?${queryParams.toString()}`;
      return apiGet<SuperviseesResponse>(endpoint);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showToast.error("Supervisee Error", errorMessage);
      throw error;
    }
  },

  async getSuperviseeById(id: string): Promise<SuperviseeDetailsResponse> {
    return apiGet<SuperviseeDetailsResponse>(`/api/supervision/admin/supervisees/${id}`);
  },

  async updateSupervisee(
    id: string,
    payload: SuperviseeUpdatePayload,
  ): Promise<SuperviseeUpdateResponse> {
    const formData = buildSuperviseeUpdateFormData(payload);
    return apiPatch<SuperviseeUpdateResponse>(
      `/api/supervision/admin/supervisees/${id}`,
      formData,
    );
  },
};
