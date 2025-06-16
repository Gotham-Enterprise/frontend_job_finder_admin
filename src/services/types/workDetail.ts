
export interface FormData {
  workType: string;
  workSetting: string;
  shiftType: string;
  timezone: string;
  language: string[];
  clinicSize: string;
  workFacility: string;
}

export interface WorkDetailsStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}