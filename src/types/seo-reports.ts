export interface JobsByCategorySpecialty {
  category: string;
  specialty: string;
  jobCount: number;
}

export interface JobsByStateCity {
  state: string;
  city: string;
  jobCount: number;
}

export interface SeoReportsData {
  isComputing?: boolean;
  totalJobs: number;
  uniqueJobs: number;
  jobsByCategorySpecialty: JobsByCategorySpecialty[];
  jobsByStateCity: JobsByStateCity[];
}

export interface SeoReportsResponse {
  success: boolean;
  data: SeoReportsData;
  fromCache: boolean;
}

export interface DuplicateJobGroup {
  title: string;
  companyName: string;
  locationCity: string;
  locationState: string;
  duplicateCount: number;
  jobIds: string[];
}

export interface DuplicateJobsResponse {
  success: boolean;
  data: DuplicateJobGroup[];
}

export interface BotLogEntry {
  timestamp: string;
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  type?: string;
}

export interface BotLogsResponse {
  success: boolean;
  data: BotLogEntry[];
}
