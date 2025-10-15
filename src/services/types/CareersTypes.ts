import type {
  Career,
  CareerFilters,
  CareerResponse,
  CareerDetailsResponse,
  CreateCareerPayload,
  UpdateCareerPayload,
  CareerApplicantResponse,
} from "../api/careers";

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
  views: number;
  postedDate: string;
  status: "active" | "closed" | "draft";
  // Optional salary range fields (added for displaying when pay/payPeriod not set)
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryRange?: string; // combined string from backend if present
  createdAtISO?: string; // raw ISO date for sorting
  createdAtTs?: number; // timestamp for efficient sorting
}

export type CareerFormData = CreateCareerPayload & {
  // Additional form-specific fields
};
