export interface JobsAdmin {
  id: string;
  title: string;
  datePosted: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  occupation: string;
  specialty?: string;
  location: string;
  locationState: string;
  companyName: string;
  jobStatus: 'Draft' | 'Published';
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryCurrency?: string;
  workType?: string;
  workSetting?: string;
  applicantCount?: number;
}

export interface JobsAdminFilters {
  page?: number;
  limit?: number;
  name?: string; 
  state?: string; 
  city?: string;
  jobStatus?: 'Draft' | 'Published';
  datePosted?: string;
  occupationId?: number;
  specialtyId?: number;
}

export interface JobsAdminResponse {
  success: boolean;
  data: JobsAdmin[];
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

export interface JobsAdminDetails {
  id: string;
  isApplied: boolean;
  isSaved: boolean;
  companyId: string;
  title: string;
  occupation: string;
  specialty?: string;
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
  applicationId: string;
}

export interface JobsAdminDetailsResponse {
  success: boolean;
  data: JobsAdminDetails;
  message?: string;
}

export interface Occupation {
  id: number;
  name: string;
  keyword: string[];
  iconUrl: string;
  specialty: Specialty[];
}

export interface Specialty {
  id: number;
  name: string;
  occupationId: number;
  subSpecialty: any[];
}

export interface OccupationsResponse {
  success: boolean;
  data: Occupation[];
}
