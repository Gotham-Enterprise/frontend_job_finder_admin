import { TeamMembersResponse } from '../types/team';
import { apiGet, apiPost, apiPut, apiPatch } from './apiUtils';

export const teamApi = {
  async getTeamMembers(employerId: string): Promise<TeamMembersResponse> {
    return apiGet<TeamMembersResponse>(`/api/admin/employer/users/${employerId}`);
  },

  async addTeamMember(employerId: string, formData: FormData): Promise<any> {
    return apiPost(`/api/admin/employer/users/${employerId}`, formData);
  },

  async updateTeamMember(employerId: string, teamMemberId: string, formData: FormData): Promise<any> {
    return apiPut(`/api/admin/employer/users/${employerId}/user/${teamMemberId}`, formData);
  },

   async updateTeamMemberStatus(employerId: string, teamMemberId: string, data: { status: string }): Promise<any> {
    return apiPatch(`/api/admin/employer/users/${employerId}/user/${teamMemberId}`, data);
  },
};
