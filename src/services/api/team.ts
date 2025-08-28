import { TeamMembersResponse } from '../types/team';
import { apiGet, apiPost, apiPatch } from './apiUtils';

export const teamApi = {
  async getTeamMembers(employerId: string): Promise<TeamMembersResponse> {
    return apiGet<TeamMembersResponse>(`/api/admin/employer/users/${employerId}`);
  },

  async addTeamMember(employerId: string, formData: FormData): Promise<any> {
    return apiPost(`/api/admin/employer/users/${employerId}`, formData);
  },

  async updateTeamMember(id: string, employerUserId: string, formData: FormData): Promise<any> {
    return apiPatch(`/api/admin/employer/users/${id}/user/${employerUserId}`, formData);
  },
};
