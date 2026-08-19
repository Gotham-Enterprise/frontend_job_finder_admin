import { JobCreationDocument, JobCreationQuestion } from './jobCreationSteps';

export interface JobFormAddress {
  // Client-only stable React key — never sent to the backend
  uiId: string;
  address: string;
  city: string;
  // "State Name (AB)" dropdown option format
  state: string;
  zipCode: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: string;
  currency: string;
}

export const ADDRESS_LIMIT = 6;

export const createEmptyAddress = (): JobFormAddress => ({
  uiId:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `addr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  salaryFrom: 0,
  salaryTo: 0,
  salaryType: 'yearly',
  currency: 'USD',
});

export interface FormData {
  title: string;
  occupationId: string;
  specialtyId: string;
  country: string;
  addresses: JobFormAddress[];
  workType: string;
  workSetting: string;
  shiftType: string;
  timezone: string;
  language: string[];
  clinicSize: string;
  workFacility: string;
  postingDate: string;
  autoRenew: boolean;
  questions?: JobCreationQuestion[];
  documents?: JobCreationDocument[];
}

export interface StepFormProps {
  step: number;
  formData: FormData;
  description: string;
  onUpdateField: (field: keyof FormData, value: any) => void;
  onUpdateAddressField: (index: number, field: keyof JobFormAddress, value: any) => void;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  onToggleMultipleLocations: (checked: boolean) => void;
  onUpdateDescription: (value: string) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  isLoadingOccupations: boolean;
  selectedOccupation: number | null;
  isEditMode?: boolean;
}
