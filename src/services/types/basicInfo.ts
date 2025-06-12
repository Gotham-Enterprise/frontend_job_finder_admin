export interface FormData {
  title: string;
  occupationId: string;
  specialtyId: string;
}

export interface BasicInfoStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  isLoadingOccupations: boolean;
  selectedOccupation: number | null;
}
