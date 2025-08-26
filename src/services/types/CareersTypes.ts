import type {
  Career,
  CareerFilters,
  CareerResponse,
  CareerDetailsResponse,
  CreateCareerPayload,
  UpdateCareerPayload,
  CareerApplicantResponse,
} from '../api/careers';

export type {
  Career,
  CareerFilters,
  CareerResponse,
  CareerDetailsResponse,
  CreateCareerPayload,
  UpdateCareerPayload,
  CareerApplicantResponse,
};

export interface CareersProps {
  className?: string;
}

export interface CareersState {
  activeJobs: Career[];
  closedJobs: Career[];
  isLoading: boolean;
  error: Error | null;
}

export interface CareerTableData {
  id: string;
  title: string;
  pay: string;
  payPeriod: string;
  type: string;
  location: string;
  applicantCount: number;
  postedDate: string;
  status: 'active' | 'closed' | 'draft';
}

export type CareerFormData = CreateCareerPayload & {
  // Additional form-specific fields
};
