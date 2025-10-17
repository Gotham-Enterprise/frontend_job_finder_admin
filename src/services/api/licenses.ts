import { apiGet } from "./apiUtils";

export interface License {
  id: string;
  name: string;
}

export interface LicenseResponse {
  success: boolean;
  data: License[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface LicenseIssuingState {
  id: string;
  name: string;
}

export interface LicenseIssuingStateResponse {
  success: boolean;
  data: LicenseIssuingState[];
}

export const fetchLicenses = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<LicenseResponse> => {
  const { q = "", page = 1, limit = 100 } = params || {};

  const queryParams = new URLSearchParams({
    q,
    page: page.toString(),
    limit: limit.toString(),
  });

  try {
    return apiGet<LicenseResponse>(`/api/categories/licenses?${queryParams.toString()}`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch licenses");
  }
};

export const fetchLicenseIssuingStates = async (): Promise<LicenseIssuingStateResponse> => {
  try {
    // This endpoint would need to be implemented in the backend
    // For now, we'll use a hardcoded list of US states
    const states = [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ];

    return {
      success: true,
      data: states.map((state, index) => ({
        id: index.toString(),
        name: state,
      })),
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch license issuing states");
  }
};
