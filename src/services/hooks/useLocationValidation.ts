import { useState } from 'react';
import { locationApi } from '../api/location';
import { LocationValidationRequest, LocationValidationResponse } from '../types/location';

export const useLocationValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const validateLocation = async (data: LocationValidationRequest) => {

    setIsValidating(true);
    setValidationErrors({});

    try {
      const response = await locationApi.validateLocation(data);
      
      if (response.success) {
        const errors: Record<string, string> = {};
        
        Object.entries(response.data).forEach(([field, fieldData]) => {
          if (!fieldData.isValid) {
            switch (field) {
              case 'address':
                errors.address = 'Please enter a valid street address';
                break;
              case 'city':
                errors.city = 'Please enter a valid city name';
                break;
              case 'state':
                errors.state = 'Please select a valid state';
                break;
              case 'zipCode':
                errors.zipCode = 'Please enter a valid ZIP code';
                break;
            }
          }
        });
        
        setValidationErrors(errors);
        return { success: true, errors, hasErrors: Object.keys(errors).length > 0 };
      }
      
      return { success: false, errors: {}, hasErrors: false };
    } catch (error) {
      console.error('Location validation error:', error);
      return { success: false, errors: {}, hasErrors: false };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateLocation,
    isValidating,
    validationErrors,
    clearValidationErrors: () => setValidationErrors({}),
  };
};
