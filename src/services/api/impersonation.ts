import { apiPost } from "./apiUtils";

export interface StartImpersonationResponse {
  success: boolean;
  data: {
    redirectUrl: string;
    expiresAt: string;
    target: {
      id: string;
      role: string;
      name: string;
      email: string;
    };
  };
}

export const impersonationApi = {
  start(targetUserId: string, returnPath?: string) {
    return apiPost<StartImpersonationResponse>("/api/admin/impersonation", {
      targetUserId,
      returnPath,
    });
  },
};
