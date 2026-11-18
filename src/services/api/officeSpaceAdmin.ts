import {
  OfficeSpaceAdminFilters,
  OfficeSpaceAdminListingsResponse,
  OfficeSpaceAdminDetailResponse,
  OfficeSpaceAdminStatsResponse,
  OfficeSpaceAdminInquiriesResponse,
  OfficeSpaceAdminStatusResponse,
  OfficeSpaceOption,
  OfficeSpaceOptionPayload,
} from "../types/officeSpace";
import { apiDelete, apiGet, apiPost, apiPut } from "./apiUtils";

export const officeSpaceAdminApi = {
  async getListings(
    filters: OfficeSpaceAdminFilters = {}
  ): Promise<OfficeSpaceAdminListingsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sort) queryParams.append("sort", filters.sort);
    if (filters.isScraped !== undefined)
      queryParams.append("isScraped", filters.isScraped.toString());
    const endpoint = `/api/admin/office-spaces?${queryParams.toString()}`;
    return apiGet<OfficeSpaceAdminListingsResponse>(endpoint);
  },

  async getListingById(id: string): Promise<OfficeSpaceAdminDetailResponse> {
    return apiGet<OfficeSpaceAdminDetailResponse>(
      `/api/admin/office-spaces/${id}`
    );
  },

  async updateListingStatus(
    id: string,
    status: string
  ): Promise<OfficeSpaceAdminStatusResponse> {
    return apiPut<OfficeSpaceAdminStatusResponse>(
      `/api/admin/office-spaces/${id}/status`,
      { status }
    );
  },

  async getStats(): Promise<OfficeSpaceAdminStatsResponse> {
    return apiGet<OfficeSpaceAdminStatsResponse>(
      "/api/admin/office-spaces/stats"
    );
  },

  async getInquiries(
    page: number = 1,
    limit: number = 10
  ): Promise<OfficeSpaceAdminInquiriesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    return apiGet<OfficeSpaceAdminInquiriesResponse>(
      `/api/admin/office-spaces/inquiries?${queryParams.toString()}`
    );
  },

  // ─── Specialties ────────────────────────────────────────────────────────────

  async getSpecialties(): Promise<{ success: boolean; data: OfficeSpaceOption[] }> {
    return apiGet<{ success: boolean; data: OfficeSpaceOption[] }>(
      "/api/admin/office-spaces/specialties"
    );
  },

  async createSpecialty(
    payload: OfficeSpaceOptionPayload
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption }> {
    return apiPost<{ success: boolean; message: string; data: OfficeSpaceOption }>(
      "/api/admin/office-spaces/specialties",
      payload
    );
  },

  async updateSpecialty(
    id: string,
    payload: Partial<OfficeSpaceOptionPayload>
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption }> {
    return apiPut<{ success: boolean; message: string; data: OfficeSpaceOption }>(
      `/api/admin/office-spaces/specialties/${id}`,
      payload
    );
  },

  async deleteSpecialty(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return apiDelete<{ success: boolean; message: string }>(
      `/api/admin/office-spaces/specialties/${id}`
    );
  },

  async reorderSpecialties(
    ids: string[]
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption[] }> {
    return apiPut<{ success: boolean; message: string; data: OfficeSpaceOption[] }>(
      "/api/admin/office-spaces/specialties/reorder",
      { ids }
    );
  },

  // ─── Property Types ─────────────────────────────────────────────────────────

  async getPropertyTypes(): Promise<{ success: boolean; data: OfficeSpaceOption[] }> {
    return apiGet<{ success: boolean; data: OfficeSpaceOption[] }>(
      "/api/admin/office-spaces/property-types"
    );
  },

  async createPropertyType(
    payload: OfficeSpaceOptionPayload
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption }> {
    return apiPost<{ success: boolean; message: string; data: OfficeSpaceOption }>(
      "/api/admin/office-spaces/property-types",
      payload
    );
  },

  async updatePropertyType(
    id: string,
    payload: Partial<OfficeSpaceOptionPayload>
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption }> {
    return apiPut<{ success: boolean; message: string; data: OfficeSpaceOption }>(
      `/api/admin/office-spaces/property-types/${id}`,
      payload
    );
  },

  async deletePropertyType(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return apiDelete<{ success: boolean; message: string }>(
      `/api/admin/office-spaces/property-types/${id}`
    );
  },

  async reorderPropertyTypes(
    ids: string[]
  ): Promise<{ success: boolean; message: string; data: OfficeSpaceOption[] }> {
    return apiPut<{ success: boolean; message: string; data: OfficeSpaceOption[] }>(
      "/api/admin/office-spaces/property-types/reorder",
      { ids }
    );
  },
};
