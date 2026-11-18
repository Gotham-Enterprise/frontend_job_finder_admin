import {
  OfficeSpaceLandlordFilters,
  OfficeSpaceLandlordListResponse,
  OfficeSpaceLandlordToggleResponse,
} from "../types/officeSpace";
import { apiGet, apiPatch } from "./apiUtils";

export const officeSpaceLandlordsApi = {
  async listLandlords(
    filters: OfficeSpaceLandlordFilters = {}
  ): Promise<OfficeSpaceLandlordListResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);

    const query = queryParams.toString();
    return apiGet<OfficeSpaceLandlordListResponse>(
      `/api/admin/landlords${query ? `?${query}` : ""}`
    );
  },

  async toggleInternal(
    id: string,
    isInternal: boolean
  ): Promise<OfficeSpaceLandlordToggleResponse> {
    return apiPatch<OfficeSpaceLandlordToggleResponse>(
      `/api/admin/landlords/${id}`,
      { isInternal }
    );
  },
};