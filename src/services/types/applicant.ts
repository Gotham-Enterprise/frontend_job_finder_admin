export interface ApplicantDetails {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  address: string;
  status: string;
  stateLicenses: string;
  dateJoined: string;
  jobTitle: string;
  companyName: string;
  dateApplied: string;
  introductionVideoUrl: string;
  introductionFilename: string;
  introductionObjectKey: string;
  coverLetterUrl: string;
  coverLetterFilename: string;
  coverLetterObjectKey: string;
  resume: {
    id: string;
    filename: string;
    fileUrl: string;
    fileObjectKey: string;
  };
  employerQuestion: EmployerQuestion[];
}

export interface ApplicantData {
  name: string;
  jobTitle: string;
  status: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  preferredSalary?: string;
  stateLicenses?: string;
  resume?: {
    fileUrl: string;
    fileName?: string;
    fileObjectKey?: string;
  };
  coverLetterUrl?: string;
  introductionVideoUrl?: string;
  location?: string;
  joinedDate?: string;
  lastActiveDate?: string;
}

export interface ApplicantProfileCardProps {
  applicant: ApplicantData;
  onViewDocument: (url: string, fileObjectKey?: string) => void;
  isViewingResume?: boolean;
}

export interface EmployerQuestion {
  question: string;
  answers?: string[];
  answer?: string | object; 
}

export interface ApplicantDetailsResponse {
  success: boolean;
  data: ApplicantDetails;
  message?: string;
}

export interface ApplicantsHeaderProps {
  totalCount: number;
  isPending?: boolean;
  isLoading?: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  onRefetch?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  appliedAt?: string;
  resumeUrl?: string;
  profilePicture?: { url: string };
  phone?: string;
  location?: string;
  experience?: string;
}

export interface MetaData {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
}

export interface ApplicantsProps {
  applicants: Applicant[];
  metaData: MetaData;
  isLoading?: boolean;
  error?: Error | null;
  onViewApplicant: (applicantId: string) => void;
  onViewResume?: (resumeUrl: string) => void;
  onPageChange: (page: number) => void;
  getStatusVariant: (status: string) => string;
  onRefetch?: () => void;
  className?: string;
}

export interface ApplicantsTableProps {
  applicants: Applicant[];
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; sortable?: boolean }>;
  getStatusVariant: (status: string) => string;
  onViewApplicant: (applicantId: string) => void;
  onViewResume?: (resumeUrl: string) => void;
  isViewingResume?: boolean;
}

export interface ApplicantsTablePaginationProps {
  data?: {
    metaData?: MetaData;
  } | null;
  filters?: {
    page: number;
  };
  onPageChange: (page: number) => void;
}

export interface LegacyApplicant {
  id: string;
  name: string;
  email: string;
  status: string;
}

export interface LegacyMetaData {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApplicantsListProps {
  applicants: LegacyApplicant[];
  metaData: LegacyMetaData;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  getStatusVariant: (status: string) => string;
  onViewApplicantDetails: (applicantId: string) => void;
}

export interface ApplicantAdditionalInfoData {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    appliedAt?: string;
    updatedAt?: string;
    dateApplied?: string;
    dateJoined?: string;
    availabilityDate?: string;
    workAuthorization?: string;
    references?: string;
    stateLicenses?: string;
    companyName?: string;
    jobTitle?: string;
}

export interface ApplicantAdditionalInfoProps {
    applicant: ApplicantAdditionalInfoData;
}

export interface EmployerQuestionAnswer {
    question: string;
    answers?: { answer: string }[] | string[];
    answer?: string | object; 
}

export interface ApplicantQuestionsProps {
    employerQuestions: EmployerQuestionAnswer[];
}

export interface ApplicantDetailsProps {
    id?: string;
}
