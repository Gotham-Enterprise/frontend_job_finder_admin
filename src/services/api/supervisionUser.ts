import { BulkActionResponse } from "../types/bulkAction";
import { apiPatch, apiPost } from "./apiUtils";

/** Admin actions shared by supervisors and supervisees (both are supervision users). */
export const supervisionUserApi = {
  /** Resend verification emails to several supervision users; each id succeeds or fails on its own. */
  async bulkResendVerificationEmail(ids: string[]): Promise<BulkActionResponse> {
    return apiPost<BulkActionResponse>(
      "/api/supervision/admin/users/bulk-send-email-verification-reminder",
      { ids },
    );
  },

  /** Approve several supervision users' pending email verifications; each id succeeds or fails on its own. */
  async bulkApproveEmailVerification(ids: string[]): Promise<BulkActionResponse> {
    return apiPatch<BulkActionResponse>(
      "/api/supervision/admin/users/bulk-approve-email-verification",
      { ids },
    );
  },

  /** Pause (hide) or resume several supervision users' profiles; each id succeeds or fails on its own. */
  async bulkSetHideProfile(ids: string[], hideProfile: boolean): Promise<BulkActionResponse> {
    return apiPatch<BulkActionResponse>("/api/supervision/admin/users/bulk-hide-profile", {
      ids,
      hideProfile,
    });
  },
};
