import React from 'react';
import LocationStep from './LocationStep';
import CompensationStep from './CompensationStep';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import { PlusIcon, TrashBinIcon } from '@/icons';
import { FormData, JobFormAddress, ADDRESS_LIMIT } from '@/services/types/stepForm';

interface LocationSalarySectionProps {
  country: string;
  addresses: JobFormAddress[];
  onUpdateField: (field: keyof FormData, value: any) => void;
  onUpdateAddressField: (index: number, field: keyof JobFormAddress, value: any) => void;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  onToggleMultipleLocations: (checked: boolean) => void;
  isEditMode?: boolean;
}

const LocationSalarySection: React.FC<LocationSalarySectionProps> = ({
  country,
  addresses,
  onUpdateAddressField,
  onAddAddress,
  onRemoveAddress,
  onToggleMultipleLocations,
  isEditMode = false,
}) => {
  const isMultipleLocations = addresses.length > 1;

  return (
    <div className="space-y-6">
      {!isEditMode && (
        <Checkbox
          id="multiple-locations"
          label="Post a Job at Multiple Locations"
          checked={isMultipleLocations}
          onChange={onToggleMultipleLocations}
        />
      )}

      {!isMultipleLocations ? (
        <>
          <LocationStep
            country={country}
            address={addresses[0]}
            index={0}
            onUpdateAddressField={onUpdateAddressField}
          />
          <CompensationStep
            address={addresses[0]}
            index={0}
            onUpdateAddressField={onUpdateAddressField}
          />
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Locations & Compensation
          </h2>

          <div className="space-y-6">
            {addresses.map((address, index) => (
              <div key={address.uiId}>
                {index > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 mb-6" />
                )}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location {index + 1} of {addresses.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemoveAddress(index)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                    aria-label={`Remove location ${index + 1}`}
                  >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
                </div>
                <LocationStep
                  country={country}
                  address={address}
                  index={index}
                  onUpdateAddressField={onUpdateAddressField}
                  embedded
                />
                <CompensationStep
                  address={address}
                  index={index}
                  onUpdateAddressField={onUpdateAddressField}
                  embedded
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={onAddAddress}
              disabled={addresses.length >= ADDRESS_LIMIT}
              startIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add another address
            </Button>
            {addresses.length >= ADDRESS_LIMIT && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                You can post to a maximum of {ADDRESS_LIMIT} locations.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSalarySection;
