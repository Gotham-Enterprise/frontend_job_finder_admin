export interface JobSeeker {
  id: string;
  name: string;
  specialty: string;
  occupation: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  jobApplications: number;
  dateJoined: string;
  resumeId: string | null;
  hasResume: boolean;
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
  profilePicture: {
    fileName: string;
    url: string;
    expiresAt: string;
  };
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  joined: string;
  lastActivity: string;
  personalSummary: string;
  documents: Document[];
  professionalBackground: ProfessionalBackground[];
  educations: Education[];
  licenses: License[];
  skills: Skill[];
  languages: Language[];
}

export interface Document {
  id: string;
  fileName: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface ProfessionalBackground {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentPosition: boolean;
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
  licenseNumber: string;
  issuingAuthority: string;
}

export interface Skill {
  id: string;
  skillName: string;
}

export interface Language {
  id: string;
  languageName: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}
export interface JobSeekerDetailsResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    specialty: string;
    occupation: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    jobApplications: number;
    dateJoined: string;
    resumeId: string | null;
    hasResume: boolean;
    lastActivity: string;
    status: string;
    profilePicture: {
      fileName: string;
      url: string;
      expiresAt: string;
    };
  };
  message?: string;
}
