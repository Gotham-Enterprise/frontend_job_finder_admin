export interface JobSeekerUpdateData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  occupationId: number;
  specialtyId?: number;
}

export interface JobSeeker {
  id: string;
  name: string;
  email?: string;
  specialty: string[];
  occupation: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  jobApplications: number;
  dateJoined: string;
  documents?: Document[];
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  profilePicture?: {
    fileName: string;
    url: string;
    expiresAt: string;
  };
  hasResume?: boolean;
  resumeObjectKey?: string;
}

export interface JobSeekerFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  radius?: number;
  location?: string;  
  specialty?: string;
  occupationId?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface JobSeekersResponse {
  success: boolean;
  data: JobSeeker[];
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

export interface JobSeekerStats {
  totalJobSeekers: number;
  activeJobSeekers: number;
  newJobSeekers: number;
  jobSeekersWithResume: number;
}

export interface JobSeekerDetails {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  profilePicture?: {
    fileName: string;
    url: string;
    expiresAt: string;
  };
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  joined: string;
  lastActivity?: string;
  personalSummary?: string;
  documents?: Document[];
  professionalBackground?: ProfessionalBackground[];
  educations?: Education[];
  licenses?: License[];
  skills?: Skill[];
  languages?: Language[];
  occupationId?: number;
  specialtyId?: number;
}

export interface Document {
  id: string;
  fileName: string;
  url: string;
  type: string;
  uploadedAt: string;
  objectKey?: string;
}

export interface ProfessionalBackground {
  id: string;
  jobTitle: string;
  companyName: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  employmentType: string;
  workplaceModel: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface License {
  id: string;
  name: string;
  issueDate: string;
  expiryDate?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
}

export interface Skill {
  id: string;
  skillName: string;
}

export interface Language {
  id: string;
  languageName: string;
  proficiency: string;
}
export interface JobSeekerDetailsResponse {
  success: boolean;
  data: JobSeekerDetails;
  message?: string;
}
