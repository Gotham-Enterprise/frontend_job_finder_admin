import { FormData, JobFormAddress } from './stepForm';

export type { FormData, JobFormAddress };

export interface CombinedJobDetailsStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
  onUpdateAddressField: (index: number, field: keyof JobFormAddress, value: any) => void;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  onToggleMultipleLocations: (checked: boolean) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  isLoadingOccupations: boolean;
  selectedOccupation: number | null;
  isEditMode?: boolean;
}
