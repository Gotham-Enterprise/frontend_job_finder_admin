import {
  OfficeSpaceAdminFilters,
  OfficeSpaceAdminListingsResponse,
  OfficeSpaceAdminDetailResponse,
  OfficeSpaceAdminStatsResponse,
  OfficeSpaceAdminInquiriesResponse,
  OfficeSpaceAdminStatusResponse,
} from "../types/officeSpace";
import { apiGet, apiPut } from "./apiUtils";

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
    const endpoint = `/api/office-spaces/admin/listings?${queryParams.toString()}`;
    return apiGet<OfficeSpaceAdminListingsResponse>(endpoint);
  },

  async getListingById(id: string): Promise<OfficeSpaceAdminDetailResponse> {
    return apiGet<OfficeSpaceAdminDetailResponse>(
      `/api/office-spaces/${id}`
    );
  },

  async updateListingStatus(
    id: string,
    status: string
  ): Promise<OfficeSpaceAdminStatusResponse> {
    return apiPut<OfficeSpaceAdminStatusResponse>(
      `/api/office-spaces/admin/listings/${id}/status`,
      { status }
    );
  },

  async getStats(): Promise<OfficeSpaceAdminStatsResponse> {
    return apiGet<OfficeSpaceAdminStatsResponse>(
      "/api/office-spaces/admin/stats"
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
      `/api/office-spaces/admin/inquiries?${queryParams.toString()}`
    );
  },
};
