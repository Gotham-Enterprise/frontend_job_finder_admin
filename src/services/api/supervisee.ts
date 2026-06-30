import {
  SuperviseeDetailsResponse,
  SuperviseeFilters,
  SuperviseeResendVerificationResponse,
  SuperviseeUpdatePayload,
  SuperviseeUpdateResponse,
  SuperviseesResponse,
} from "../types/supervisee";
import { HideProfileResponse } from "../types/supervisor";
import { apiGet, apiPatch, apiPost } from "./apiUtils";
import { buildSuperviseeUpdateFormData } from "../utils/superviseeProfileForm";
import { showToast } from "../utils/toast";

export const superviseeApi = {
  async getSupervisees(filters: SuperviseeFilters = {}): Promise<SuperviseesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

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

  /**
   * Resend the email verification link to a supervisee who hasn't confirmed their email.
   * `id` is the supervision user id (the same id used by the list/detail endpoints).
   * Backend returns 400 if the user's email is already verified.
   */
  async resendVerificationEmail(id: string): Promise<SuperviseeResendVerificationResponse> {
    return apiPost<SuperviseeResendVerificationResponse>(
      `/api/supervision/admin/users/${id}/send-email-verification-reminder`,
    );
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

  /**
   * Hide or show a supervisee's public profile.
   * `id` is the supervision user id. Note the endpoint has no `/supervisees/` segment.
   */
  async setHideProfile(id: string, hideProfile: boolean): Promise<HideProfileResponse> {
    return apiPatch<HideProfileResponse>(
      `/api/supervision/admin/${id}/hide-profile`,
      { hideProfile },
    );
  },
};
