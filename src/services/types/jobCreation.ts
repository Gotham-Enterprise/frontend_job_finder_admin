export interface JobCreationForm {

  title: string;
  occupationId: number | string;
  specialtyId: number | string;
  

  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
    
  workType: 'full-time' | 'part-time' | 'contract';
  workSetting: 'onsite' | 'remote' | 'hybrid';
  shiftType: string;
  timezone: string;
  language: string;
  clinicSize: string;
  workFacility: string;
  
  currency: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: 'hourly' | 'monthly' | 'yearly';
  
  description: string;

  postingDate: 'today' | 'this-week' | 'this-month';
}

export interface JobCreationRequest {
  title: string;
  occupationId: number;
  specialtyId?: number;
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workType: string;
  workSetting: string;
  shiftType: string;
  timezone: string;
  language: string;
  clinicSize: string;
  workFacility: string;
  currency: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: string;
  description: string;
  postingDate: string;
}

export interface JobCreationResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
  };
  message?: string;
}

export interface OccupationWithSpecialties {
  id: number;
  name: string;
  keyword: string[];
  iconUrl: string;
  specialty: {
    id: number;
    name: string;
    occupationId: number;
    subSpecialty: any[];
  }[];
}

export interface OccupationsListResponse {
  success: boolean;
  data: OccupationWithSpecialties[];
}


export interface JobPostingPayload {
  companyId: string;
  jobTitle: string;
  occupationId: number;
  specialtyId?: number;
  locationCountry: string;
  locationState: string;
  locationCity: string;
  locationZipCode: string;
  locationAddress: string;
  workType: string;
  workSetting: string;
  workFacility: string;
  salaryCurrency: string;
  salaryRangeStart: number;
  salaryRangeEnd: number;
  salaryType: string;
  autoRenew: boolean;
  shiftType: string;
  telemedicine?: string;
  languages: number[];
  companySize: string;
  postingDate: string;
  status: string;
  jobDescription: string;
  questions: JobQuestionPayload[];
  documents?: JobDocumentPayload[];
}


export interface JobQuestionPayload {
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId?: number | null;
  options?: string[];
  required: boolean;
  isActive: boolean;
  isDefault: boolean;
}


export interface JobDocumentPayload {
  documentName: string;
  documentType: string;
  documentDescription: string;
}


export interface JobPostingResponse {
  success: boolean;
  data: {
    id: string;
    jobTitle: string;
  };
  message?: string;
}

export type AITonesProps = 'formal' | 'casual' | 'enthusiastic' | 'optimistic' | 'conversational' | 'inspirational' | 'informative' | 'informal' | 'persuasive' | 'cooperative';


export interface JobCreationPayload {
  companyId: string;
  jobTitle: string;
  occupationId: number;
  specialtyId: number;
  locationCountry: string;
  locationState: string;
  locationCity: string;
  locationZipCode: string;
  locationAddress: string;
  workType: string;
  workSetting: string;
  workFacility: string;
  salaryCurrency: string;
  salaryRangeStart: number;
  salaryRangeEnd: number;
  salaryType: string;
  autoRenew: boolean;
  shiftType: string;
  telemedicine?: string;
  languages: number[];
  companySize: string;
  postingDate: string;
  status: string;
  jobDescription: string;
  step?: number;
  questions: Array<{
    questionText: string;
    questionTypeId: number;
    questionSubTypeId: number;
    questionSubTypeValueId?: number;
    required: boolean;
    isActive: boolean;
    isDefault: boolean;
    options?: string[];
  }>;
  documents: Array<{
    documentName: string;
    documentType: string;
    documentDescription: string;
  }>;
}

export interface AIJobDescriptionPayload {
  tone: AITonesProps;
  jobTitle: string;
  occupationId: number;
  specialtyId: number;
  workType?: string;
  workSetting?: string;
  locationCountry?: string;
  locationState: string;
  locationCity?: string;
  locationZipCode: string;
  locationAddress?: string;
  workFacility?: string;
  salaryCurrency?: string;
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryType?: string;
  shiftType?: string;
  languages?: number[];
  companySize?: string;
}
