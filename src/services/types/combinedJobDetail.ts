
export interface FormData {
    title: string;
    occupationId: string;
    specialtyId: string;
    country: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    workType: string;
    workSetting: string;   
    shiftType: string;
    timezone: string;
    language: string[];
    clinicSize: string;
    workFacility: string;
    currency: string;
    salaryFrom: number;
    salaryTo: number;
    salaryType: string;
    postingDate: string;
    autoRenew: boolean;
  }
  
  export interface CombinedJobDetailsStepProps {
    formData: FormData;
    onUpdateField: (field: keyof FormData, value: any) => void;
    occupationOptions: Array<{ value: string; label: string }>;
    specialtyOptions: Array<{ value: string; label: string }>;
    isLoadingOccupations: boolean;
    selectedOccupation: number | null;
  }
  