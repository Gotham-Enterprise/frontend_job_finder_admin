export interface Employer {
  id: string;
  companyName: string;
  email: string;
  state: string;
  jobPostCount: number;
  dateJoined: string;
  lastActivity: string;
  status: string;
}

export interface EmployerFilters {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  status?: string;
}

export interface EmployersResponse {
  success: boolean;
  data: Employer[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EmployerStatesResponse {
  success: boolean;
  data: string[];
}
