import { JobFormAddress } from './stepForm';

export interface CompensationStepProps {
  address: JobFormAddress;
  index: number;
  onUpdateAddressField: (index: number, field: keyof JobFormAddress, value: any) => void;
  // Renders without its own card chrome when inside the multi-location card
  embedded?: boolean;
}
