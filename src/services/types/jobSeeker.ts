export interface JobSeeker {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  jobApplications: number;
  dateJoined: string;
  occupation: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
  profilePicture: {
    fileName: string;
    url: string;
    expiresAt: string;
  };
}

export interface JobSeekerFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  specialty?: string;
  occupationId?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface JobSeekersResponse {
  success: boolean;
  data: {
    items: JobSeeker[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  message?: string;
}

export interface JobSeekerStats {
  totalJobSeekers: number;
  activeJobSeekers: number;
  newJobSeekers: number;
  jobSeekersWithResume: number;
}
