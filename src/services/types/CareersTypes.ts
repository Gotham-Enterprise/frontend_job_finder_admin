export interface JobData {
  id: string;
  title: string;
  pay: string;
  payPeriod: string;
  type: string;
  location: string;
  applicantCount: number;
  postedDate: string;
  status: 'active' | 'closed';
}

export interface CareersProps {
  className?: string;
}

export interface CareersState {
  activeJobs: JobData[];
  closedJobs: JobData[];
  isLoading: boolean;
  error: Error | null;
}
