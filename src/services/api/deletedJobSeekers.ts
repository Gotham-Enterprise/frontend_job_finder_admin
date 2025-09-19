import { apiGet, apiPost } from "./apiUtils";

export interface DeletedJobSeekerAccount {
  id: string;
  originalUserId: string;
  originalEmail: string;
  originalUsername: string;
  originalFirstName: string;
  originalLastName: string;
  originalFullName?: string;
  originalRole: string;
  originalStatus: string;
  originalCreatedAt: string;
  originalUpdatedAt: string;

  // Profile information
  originalPhoneNumber?: string;
  originalBirthday?: string;
  originalCountry?: string;
  originalZipCode?: string;
  originalCity?: string;
  originalState?: string;
  originalAddress?: string;

  // Candidate profile information
  originalCandidateProfileId: string;
  originalOccupationId: number;
  originalMonthsOfExperience: number;
  originalSpecialtyId: number;
  originalAvailabilityToStart?: string;
  originalOpenForStateWideJobs: boolean;
  originalWillingToRelocate: boolean;
  originalDesiredSalary?: number;
  originalPersonalSummary?: string;
  originalDegree?: string;

  // Deletion information
  deletedBy: string;
  deletedByAdmin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deletedAt: string;
  maskedEmail: string;
  maskedUsername: string;

  // Restoration information
  isRestored: boolean;
  restoredBy?: string;
  restoredByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  restoredAt?: string;

  // Additional metadata
  deletionReason?: string;
  notes?: string;
  totalApplicationsCount: number;
}

export interface DeletedJobSeekersFilters {
  page?: number;
  limit?: number;
  search?: string;
  deletedBy?: string;
  isRestored?: boolean;
  deletedAfter?: string;
  deletedBefore?: string;
}

export interface DeletedJobSeekersResponse {
  success: boolean;
  data: DeletedJobSeekerAccount[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface DeletedJobSeekerDetailsResponse {
  success: boolean;
  data: DeletedJobSeekerAccount;
  message?: string;
}

export interface RestoreAccountRequest {
  adminPassword: string;
}

export interface RestoreAccountResponse {
  success: boolean;
  message: string;
  data?: {
    restoredUserId: string;
    restoredEmail: string;
    restoredAt: string;
  };
}

export const deletedJobSeekersApi = {
  /**
   * Get all deleted job seeker accounts with pagination and filtering
   */
  async getDeletedJobSeekerAccounts(filters: DeletedJobSeekersFilters = {}): Promise<DeletedJobSeekersResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.deletedBy) queryParams.append("deletedBy", filters.deletedBy);
    if (filters.isRestored !== undefined) {
      queryParams.append("isRestored", filters.isRestored.toString());
    }
    if (filters.deletedAfter) queryParams.append("deletedAfter", filters.deletedAfter);
    if (filters.deletedBefore) queryParams.append("deletedBefore", filters.deletedBefore);

    const endpoint = `/api/admin/jobseekers/deleted-accounts?${queryParams.toString()}`;

    return apiGet<DeletedJobSeekersResponse>(endpoint);
  },

  /**
   * Get specific deleted job seeker account details
   */
  async getDeletedJobSeekerAccountById(deletedAccountId: string): Promise<DeletedJobSeekerDetailsResponse> {
    return apiGet<DeletedJobSeekerDetailsResponse>(`/api/admin/jobseekers/deleted-accounts/${deletedAccountId}`);
  },

  /**
   * Restore a deleted job seeker account
   */
  async restoreJobSeekerAccount(deletedAccountId: string, adminPassword: string): Promise<RestoreAccountResponse> {
    return apiPost<RestoreAccountResponse>(`/api/admin/jobseekers/deleted-accounts/${deletedAccountId}/restore`, {
      adminPassword,
    });
  },

  /**
   * Get permanent deletion history (includes both deletions and restorations)
   */
  async getPermanentDeletionHistory(page = 1, limit = 10): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    return apiGet<any>(`/api/admin/jobseekers/permanent-deletion-history?${queryParams.toString()}`);
  },
};
