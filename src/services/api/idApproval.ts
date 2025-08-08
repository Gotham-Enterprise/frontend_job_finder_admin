
import { apiGet, apiPatch } from './apiUtils';
import { IdApprovalFilters, IdApprovals, IdApprovalStatusUpdate, IdApprovalStatusUpdateResponse } from '../types/idApproval';

export const idApprovalApi = {
  async getIdApprovals(filters: IdApprovalFilters): Promise<IdApprovals> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);

    const endpoint = `/api/admin/id-verifications?${queryParams.toString()}`;

    return apiGet<IdApprovals>(endpoint);
  }
}

export const updateIdApprovalStatus = async (data: IdApprovalStatusUpdate): Promise<IdApprovalStatusUpdateResponse> => {
  const endpoint = `/api/admin/id-verifications/${data.id}/status`;

  return apiPatch<IdApprovalStatusUpdateResponse>(endpoint, { status: data.status });
}