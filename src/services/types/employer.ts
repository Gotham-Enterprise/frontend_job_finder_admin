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

export interface JobPost {
  id: string;
  title: string;
  postingDate: string;
  _count: {
    applicants: number;
  };
  status?: string;
  employmentType?: string;
  location?: string;
  salaryRange?: string;
  experienceLevel?: string;
  description?: string;
}

export interface EmployerDetails {
  id: string;
  companyName: string;
  averageRating: string;
  email: string;
  phoneNumber: string;
  overview: string;
  employeeCount: number;
  jobPostCount: number;
  totalApplicants: number;
  address: string;
  city: string;
  state: string;
  country: string;
  dateJoined: string;
  lastActivity: string;
  status: string;
  jobPost: JobPost[];
}

export interface EmployerDetailsResponse {
  success: boolean;
  data: EmployerDetails;
  message?: string;
}

export interface CompanyReview {
  id: string;
  name: string;
  review: string;
  rating: number;
}

export interface CompanyReviewsData {
  id: string;
  companyName: string;
  averageRating: string;
  email: string;
  state: string;
  country: string;
  address: string;
  city: string;
  phoneNumber: string;
  overview: string;
  employeeCount: number;
  jobPostCount: number;
  totalApplicants: number;
  dateJoined: string;
  lastActivity: string;
  status: string;
  companyReviews: CompanyReview[];
}

export interface CompanyReviewsResponse {
  success: boolean;
  data: CompanyReviewsData;
  message?: string;
}
