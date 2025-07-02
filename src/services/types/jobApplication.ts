export interface JobApplication {
  id: string;
  name: string;
  avatarUrl: string;
  avatarObjectKey: string;
  applicationDate: string;
  jobTitle: string;
  jobLocationState: string;
  jobLocationCity: string;
  status: string;
  companyName: string;
  resumeUrl: string;
  resumeFilename: string;
  resumeObjectKey: string;
  hasResume: boolean;
}

export interface JobApplicationFilters {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  companyName?: string;
  status?: string;
}

export interface JobApplicationsResponse {
  success: boolean;
  data: JobApplication[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface JobApplicationDetails {
  id: string;
  name: string;
  avatarUrl: string;
  avatarObjectKey: string;
  applicationDate: string;
  jobTitle: string;
  jobLocationState: string;
  jobLocationCity: string;
  status: string;
  companyName: string;
  resumeUrl: string;
  resumeFilename: string;
  resumeObjectKey: string;
  hasResume: boolean;
}

export interface JobApplicationDetailsResponse {
  success: boolean;
  data: JobApplicationDetails;
  message?: string;
}
