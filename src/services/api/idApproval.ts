import {
  IdApproval,
  IdApprovalBatchUpdate,
  IdApprovalBatchUpdateResponse,
  IdApprovalDetailResponse,
  IdApprovalFilters,
  IdApprovals,
  IdApprovalStatusUpdate,
  IdApprovalStatusUpdateResponse,
} from "../types/idApproval";
import { apiGet, apiPatch, apiPost } from "./apiUtils";

export const idApprovalApi = {
  async getIdApprovals(filters: IdApprovalFilters): Promise<IdApprovals> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);

    const endpoint = `/api/admin/id-verifications?${queryParams.toString()}`;

    return apiGet<IdApprovals>(endpoint);
  },
  async getIdApprovalDetails(id: IdApproval["id"]): Promise<IdApprovalDetailResponse> {
    const endpoint = `/api/admin/id-verifications/${id}`;

    return apiGet<IdApprovalDetailResponse>(endpoint);
  },
  async updateIdApprovalStatus(data: IdApprovalStatusUpdate): Promise<IdApprovalStatusUpdateResponse> {
    const endpoint = `/api/admin/id-verifications/${data.id}/status`;

    return apiPatch<IdApprovalStatusUpdateResponse>(endpoint, { status: data.status });
  },
  async batchUpdateIdApprovalStatus(data: IdApprovalBatchUpdate): Promise<IdApprovalBatchUpdateResponse> {
    const endpoint = `/api/admin/id-verifications/batch-status`;

    return apiPatch<IdApprovalBatchUpdateResponse>(endpoint, data);
  },
  async unlockAccount(id: IdApproval["id"]): Promise<{ success: boolean }> {
    const endpoint = `/api/admin/id-verifications/${id}/unlock-account`;

    return apiPost<{ success: boolean }>(endpoint);
  },
};
