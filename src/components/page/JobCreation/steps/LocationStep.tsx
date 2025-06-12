import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';

interface FormData {
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface LocationStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  formData,
  onUpdateField
}) => {
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Location
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label>Country *</Label>
          <Select
            options={countryOptions}
            onChange={(value: string) => onUpdateField('country', value)}
            defaultValue={formData.country}
          />
        </div>

        <div>
          <Label>Street Address *</Label>
          <Input
            placeholder="123 Main Street"
            defaultValue={formData.address}
            onChange={(e) => onUpdateField('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>City *</Label>
            <Input
              placeholder="City"
              defaultValue={formData.city}
              onChange={(e) => onUpdateField('city', e.target.value)}
            />
          </div>
          <div>
            <Label>State/Province *</Label>
            <Input
              placeholder="State"
              defaultValue={formData.state}
              onChange={(e) => onUpdateField('state', e.target.value)}
            />
          </div>
          <div>
            <Label>ZIP/Postal Code *</Label>
            <Input
              placeholder="12345"
              defaultValue={formData.zipCode}
              onChange={(e) => onUpdateField('zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
