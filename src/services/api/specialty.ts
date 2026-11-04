import {
  SpecialtyListResponse,
  SpecialtyResponse,
  CreateSpecialtyPayload,
  UpdateSpecialtyPayload,
} from '../types/specialty';
import { apiGet, apiPost, apiPut, apiDelete } from './apiUtils';

export const specialtyApi = {
  async getSpecialtiesByOccupation(occupationId: number): Promise<SpecialtyListResponse> {
    return apiGet<SpecialtyListResponse>(`/api/categories/specialties/occupation/${occupationId}`);
  },

  async createSpecialty(payload: CreateSpecialtyPayload): Promise<SpecialtyResponse> {
    return apiPost<SpecialtyResponse>('/api/categories/specialties', payload);
  },

  async updateSpecialty(id: number, payload: UpdateSpecialtyPayload): Promise<SpecialtyResponse> {
    return apiPut<SpecialtyResponse>(`/api/categories/specialties/${id}`, payload);
  },

  async deleteSpecialty(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete<{ success: boolean; message: string }>(`/api/categories/specialties/${id}`);
  },
};

