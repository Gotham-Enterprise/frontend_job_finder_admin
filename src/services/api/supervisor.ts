import {
  SupervisorFilters,
  SupervisorsResponse,
  SupervisorDetailsResponse,
  SupervisorActionResponse,
  SupervisorResendVerificationResponse,
  SupervisorUpdatePayload,
  SupervisorUpdateResponse,
} from "../types/supervisor";
import { buildSupervisorUpdateFormData } from "../utils/supervisorProfileForm";
import { apiGet, apiPatch, apiPost } from "./apiUtils";
import { showToast } from "../utils/toast";

export const supervisorApi = {
  async getSupervisors(filters: SupervisorFilters = {}): Promise<SupervisorsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      // Only send verificationStatus when a specific one is selected; omitting it returns all statuses
      if (filters.verificationStatus) queryParams.append("verificationStatus", filters.verificationStatus);

      const endpoint = `/api/supervision/admin/supervisors?${queryParams.toString()}`;
      return apiGet<SupervisorsResponse>(endpoint);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showToast.error("Supervisor Error", errorMessage);
      throw error;
    }
  },

  async getSupervisorById(id: string): Promise<SupervisorDetailsResponse> {
    return apiGet<SupervisorDetailsResponse>(`/api/supervision/admin/supervisors/${id}`);
  },

  async approveSupervisor(id: string, verificationNotes?: string): Promise<SupervisorActionResponse> {
    const body = verificationNotes ? { verificationNotes } : {};
    return apiPatch<SupervisorActionResponse>(
      `/api/supervision/admin/supervisors/${id}/approve`,
      body
    );
  },

  async rejectSupervisor(id: string, verificationNotes: string): Promise<SupervisorActionResponse> {
    return apiPatch<SupervisorActionResponse>(
      `/api/supervision/admin/supervisors/${id}/reject`,
      { verificationNotes }
    );
  },

  async editSupervisorVerificationNotes(id: string, verificationNotes: string): Promise<SupervisorActionResponse> {
    return apiPatch<SupervisorActionResponse>(
      `/api/supervision/admin/supervisors/${id}/edit-verification-notes`,
      { verificationNotes }
    );
  },

  /**
   * Resend the email verification link to a supervisor who hasn't confirmed their email.
   * `id` is the supervision user id (the same id used by the list/detail endpoints).
   * Backend returns 400 if the user's email is already verified.
   */
  async resendVerificationEmail(id: string): Promise<SupervisorResendVerificationResponse> {
    return apiPost<SupervisorResendVerificationResponse>(
      `/api/supervision/admin/users/${id}/send-email-verification-reminder`,
    );
  },

  async updateSupervisor(id: string, payload: SupervisorUpdatePayload): Promise<SupervisorUpdateResponse> {
    const formData = buildSupervisorUpdateFormData(payload);
    return apiPatch<SupervisorUpdateResponse>(
      `/api/supervision/admin/supervisors/${id}`,
      formData,
    );
  },
};
