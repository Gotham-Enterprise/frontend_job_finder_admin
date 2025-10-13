export interface EmployerUpdateData {
  name: string;
  overview: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  uploadProfilePicture?: File;
}

export interface Employer {
  id: string;
  companyName: string;
  email: string;
  state: string;
  city?: string;
  address?: string;
  zipCode?: string;
  country?: string;
  jobPostCount: number;
  dateJoined: string;
  lastActivity: string;
  status: string;
  currentPlan?: string;
  currentPlanId?: number;
  avatarUrl?: string;
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

export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  profilePictureUrl?: string;
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
  zipCode: string;
  dateJoined: string;
  lastActivity: string;
  status: string;
  jobPost: JobPost[];
  companyUsers?: CompanyUser[];
  avatarUrl?: string;
  profilePicture?: {
    fileName: string;
    url: string;
    expiresAt: string;
  };
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
