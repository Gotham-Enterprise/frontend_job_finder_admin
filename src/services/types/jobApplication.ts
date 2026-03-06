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
  companyName?: string;
  status?: string;
  city?: string;
  state?: string;
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

export interface EmployerQuestion {
  question: string;
  answers: string;
}

export interface Documents {
  type: string;
  fileName: string;
  url: string;
  objectKey?: string;
  expiresAt?: string;
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
  employerQuestion?: EmployerQuestion[];
  documents: Documents[];
  email: string;
  jobDescription: string;
  jobId: string;
}

export interface JobApplicationDetailsResponse {
  success: boolean;
  data: JobApplicationDetails;
  message?: string;
}
