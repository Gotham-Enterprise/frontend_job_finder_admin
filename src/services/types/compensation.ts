export interface FormData {
  currency: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: string;
}

export interface CompensationStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}