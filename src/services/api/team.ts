import { TeamMembersResponse } from '../types/team';
import { apiGet } from './apiUtils';

export const teamApi = {
  async getTeamMembers(employerId: string): Promise<TeamMembersResponse> {
    return apiGet<TeamMembersResponse>(`/api/admin/employer/users?employerId=${employerId}`);
  },
};
