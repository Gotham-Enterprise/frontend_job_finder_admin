import { apiRequest } from "./apiUtils";

export interface DeactivateUserRequest {
  reason: string;
}

export interface ReactivateUserRequest {
  reason: string;
}

export interface DeactivatedJobSeekersFilters {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  deactivatedBy?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  occupation?: string;
}

export interface DeactivatedJobSeeker {
  id: string;
  userId: string;
  deactivationReason: string;
  isDeactivatedBySystem: boolean;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string;
  reactivatedBy?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    status: string;
    profile?: any;
    candidateProfile?: {
      occupation?: {
        id: number;
        name: string;
      };
      specialty?: string;
    };
  };
  deactivatedByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DeactivatedJobSeekersResponse {
  success: boolean;
  data: {
    deactivatedUsers: DeactivatedJobSeeker[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next_page: boolean;
      has_previous_page: boolean;
    };
  };
}

export interface DeactivationStats {
  success: boolean;
  data: {
    totalDeactivated: number;
    totalReactivated: number;
    todayDeactivated: number;
    thisWeekDeactivated: number;
    thisMonthDeactivated: number;
    byReason: Array<{
      reason: string;
      count: number;
    }>;
    byAdminStats: Array<{
      adminId: string;
      adminName: string;
      deactivationCount: number;
      reactivationCount: number;
    }>;
  };
}

export interface DeactivationHistoryEntry {
  id: string;
  deactivationReason: string;
  isDeactivatedBySystem: boolean;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string;
  reactivatedBy?: string;
  deactivatedByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reactivatedByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DeactivationHistoryResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      status: string;
    };
    history: DeactivationHistoryEntry[];
  };
}

export const adminUserManagementApi = {
  /**
   * Deactivate a user account
   */
  async deactivateUser(userId: string, data: DeactivateUserRequest) {
    return apiRequest(`/api/admin/users/${userId}/deactivate`, {
      method: "POST",
      body: data,
    });
  },

  /**
   * Reactivate a user account
   */
  async reactivateUser(userId: string, data: ReactivateUserRequest) {
    return apiRequest(`/api/admin/users/${userId}/reactivate`, {
      method: "POST",
      body: data,
    });
  },

  /**
   * Get deactivated jobseekers with pagination and filtering
   */
  async getDeactivatedJobSeekers(filters: DeactivatedJobSeekersFilters = {}): Promise<DeactivatedJobSeekersResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/users/deactivated-jobseekers${queryString ? `?${queryString}` : ""}`;

    return apiRequest<DeactivatedJobSeekersResponse>(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get deactivation statistics
   */
  async getDeactivationStats(): Promise<DeactivationStats> {
    return apiRequest<DeactivationStats>("/api/admin/users/deactivation-stats", {
      method: "GET",
    });
  },

  /**
   * Get user deactivation history
   */
  async getUserDeactivationHistory(userId: string): Promise<DeactivationHistoryResponse> {
    return apiRequest<DeactivationHistoryResponse>(`/api/admin/users/${userId}/deactivation-history`, {
      method: "GET",
    });
  },
};
