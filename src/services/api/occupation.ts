import {
  OccupationListResponse,
  OccupationResponse,
  SingleOccupationResponse,
  OccupationQueryParams,
  CreateOccupationPayload,
  UpdateOccupationPayload,
} from '../types/occupation';
import { apiGet, apiPost, apiPut, apiDelete } from './apiUtils';

export const occupationApi = {
  // Existing helper used by LinkModal
  async getOccupationList(): Promise<OccupationListResponse> {
    return apiGet<OccupationListResponse>('/api/admin/jobseekers/occupation/list');
  },

  async getOccupations(params: OccupationQueryParams = {}): Promise<OccupationResponse> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.hasJob !== undefined) query.append('hasJob', params.hasJob.toString());
    if (params.includeAll !== undefined) query.append('includeAll', params.includeAll.toString());
    if (params.isDropdown !== undefined) query.append('isDropdown', params.isDropdown.toString());
    if (params.search && params.search.trim()) query.append('search', params.search.trim());

    const queryString = query.toString();
    const endpoint = `/api/categories/occupations${queryString ? `?${queryString}` : ''}`;
    return apiGet<OccupationResponse>(endpoint);
  },

  async getOccupationById(id: number): Promise<SingleOccupationResponse> {
    return apiGet<SingleOccupationResponse>(`/api/categories/occupations/${id}`);
  },

  async createOccupation(payload: CreateOccupationPayload): Promise<SingleOccupationResponse> {
    return apiPost<SingleOccupationResponse>('/api/categories/occupations', payload);
  },

  async updateOccupation(id: number, payload: UpdateOccupationPayload): Promise<SingleOccupationResponse> {
    return apiPut<SingleOccupationResponse>(`/api/categories/occupations/${id}`, payload);
  },

  async deleteOccupation(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete<{ success: boolean; message: string }>(`/api/categories/occupations/${id}`);
  },
};
