export interface Job {
  id: string;
  isApplied: boolean;
  companyId: string;
  title: string;
  occupation: string;
  location: string;
  isSalaryVisible: boolean;
  salaryRangeStart: number;
  salaryRangeEnd: number;
  salaryType: string;
  salaryCurrency: string;
  workSetting: string;
  workType: string;
  datePosted: string;
  applicantCount: number;
  workFacility: string;
  jobDescription: string;
}

export interface JobApplicant {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  status: string;
}

export interface JobDetailsData {
  job: Job;
  applicants: JobApplicant[];
}

export interface JobDetailsResponse {
  success: boolean;
  data: JobDetailsData;
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

export interface JobDetailsFilters {
  page?: number;
  limit?: number;
}
