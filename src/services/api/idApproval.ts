
import { apiGet } from './apiUtils';
import { IdApprovals } from '../types/idApproval';

export const idApprovalApi = {
  async getIdApprovals(): Promise<IdApprovals> {
    const endpoint = `/api/admin/id-verifications`;

    return apiGet<IdApprovals>(endpoint);
   }
}