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
