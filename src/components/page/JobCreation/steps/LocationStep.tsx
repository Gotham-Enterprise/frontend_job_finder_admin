import React, { useEffect, useState, useCallback } from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { useStates } from '@/services/hooks/useStates';
import { useLocationValidation } from '@/services/hooks/useLocationValidation';
import { useToast } from '@/context/ToastContext';

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
  const { data: statesData, isLoading: statesLoading, error: statesError } = useStates();
  const { validateLocation, isValidating, validationErrors, clearValidationErrors } = useLocationValidation();
  const { addToast } = useToast();
  const [fieldLoadingStates, setFieldLoadingStates] = useState({
    address: false,
    city: false,
  });


  useEffect(() => {
    if (!formData.country) {
      onUpdateField('country', 'US');
    }
  }, [formData.country, onUpdateField]); 
  const validateLocationFields = useCallback(async (updatedData?: Partial<FormData>) => {
   
    const dataToValidate = updatedData ? { ...formData, ...updatedData } : formData;
   
    if (dataToValidate.address && dataToValidate.city && dataToValidate.zipCode) {
 
      const result = await validateLocation({
        address: dataToValidate.address,
        city: dataToValidate.city,
        state: dataToValidate.state || '',
        zipCode: dataToValidate.zipCode,
      });

      if (result.hasErrors) {
        const invalidFields = Object.keys(result.errors);
        if (invalidFields.length > 0) {
          addToast({
            variant: 'error',
            title: 'Invalid Location Information',
            message: `Please check: ${invalidFields.join(', ')}`,
            duration: 5000,
          });
        }
      }
    }
  }, [formData, validateLocation, addToast]);  
  const addressChange = useCallback(async (value: string) => {
    onUpdateField('address', value);
    clearValidationErrors();
    
    if (value.trim()) {
      setFieldLoadingStates(prev => ({ ...prev, address: true }));
      
  
      setTimeout(async () => {
        setFieldLoadingStates(prev => ({ ...prev, address: false }));
        await validateLocationFields({ address: value });
      }, 800);
    }
  }, [onUpdateField, clearValidationErrors, validateLocationFields]); 

  const cityChange = useCallback(async (value: string) => {
    onUpdateField('city', value);
    clearValidationErrors();
    
    if (value.trim()) {
      setFieldLoadingStates(prev => ({ ...prev, city: true }));
      
    
      setTimeout(async () => {
        setFieldLoadingStates(prev => ({ ...prev, city: false }));
        await validateLocationFields({ city: value });
      }, 800);
    }
  }, [onUpdateField, clearValidationErrors, validateLocationFields]);

  const stateChange = useCallback(async (value: string) => {
    onUpdateField('state', value);
    clearValidationErrors();
    
    await validateLocationFields({ state: value });
  }, [onUpdateField, clearValidationErrors, validateLocationFields]);


  const zipCodeChange = useCallback(async (value: string) => {
    onUpdateField('zipCode', value);
    clearValidationErrors();
    
    if (value.trim()) {
      await validateLocationFields({ zipCode: value });
    }
  }, [onUpdateField, clearValidationErrors, validateLocationFields]);

  const countryOptions = [
    { value: 'US', label: 'United States' },
  ];

  const stateOptions = [
    { value: '', label: 'Select State' },
    ...(statesData?.data?.states?.map(state => ({
      value: state.abbreviation,
      label: state.name
    })) || [])
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
            defaultValue="US"
            disabled={true}
          />
        </div>        <div>
          <Label>Address *</Label>
          <Input
            placeholder="123 Main Street"
            defaultValue={formData.address}
            onChange={(e) => addressChange(e.target.value)}
            disabled={fieldLoadingStates.address || isValidating}
            error={!!validationErrors.address}
            hint={validationErrors.address}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">          <div>
            <Label>City *</Label>
            <Input
              placeholder="City"
              defaultValue={formData.city}
              onChange={(e) => cityChange(e.target.value)}
              disabled={fieldLoadingStates.city || isValidating}
              error={!!validationErrors.city}
              hint={validationErrors.city}
            />
          </div>          <div>
            <Label>State/Province *</Label>
            <Select
              options={stateOptions}
              onChange={(value: string) => stateChange(value)}
              defaultValue={formData.state}
              disabled={statesLoading}
              placeholder={statesLoading ? "Loading states..." : "Select State"}
            />
            {statesError && (
              <p className="text-red-500 text-sm mt-1">Error loading states</p>
            )}
          </div>          <div>
            <Label>ZIP/Postal Code *</Label>
            <Input
              placeholder="12345"
              defaultValue={formData.zipCode}
              onChange={(e) => zipCodeChange(e.target.value)}
              error={!!validationErrors.zipCode}
              hint={validationErrors.zipCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
