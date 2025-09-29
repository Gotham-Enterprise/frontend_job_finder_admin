import React, { useEffect, useState, useCallback, useRef } from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { useStatesCities, useCitiesByState } from '@/lib/useStatesCities';
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
  const { data: statesCities, isLoading: isLoadingStates } = useStatesCities();
  const { validateLocation, isValidating, validationErrors, clearValidationErrors } = useLocationValidation();
  const { addToast } = useToast();  
  
  // City search state
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  
  const [fieldLoadingStates, setFieldLoadingStates] = useState({
    address: false,
    city: false,
  });

  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastTimeRef = useRef<number>(0);

  // Extract state abbreviation from formatted state string "State Name (AB)" -> "AB"
  const getStateAbbreviation = (formattedState: string) => {
    const match = formattedState.match(/\(([^)]+)\)$/);
    return match ? match[1] : formattedState;
  };
  
  const stateAbbr = formData.state ? getStateAbbreviation(formData.state) : '';
  const { data: cities, isLoading: isLoadingCities } = useCitiesByState(stateAbbr);
  
  // Filter cities based on search
  const filteredCities = cities?.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  ) || [];


  useEffect(() => {
    if (!formData.country) {
      onUpdateField('country', 'US');
    }
  }, [formData.country, onUpdateField]);   const validateLocationFields = useCallback(async (updatedData?: Partial<FormData>) => {
     const dataToValidate = updatedData ? { ...formData, ...updatedData } : formData;
   
    if (dataToValidate.address?.trim() && dataToValidate.city?.trim() && dataToValidate.zipCode?.trim()) {
 
      const result = await validateLocation({
        address: dataToValidate.address.trim(),
        city: dataToValidate.city.trim(),
        state: dataToValidate.state || '',
        zipCode: dataToValidate.zipCode.trim(),
      });

      if (result.hasErrors) {
        const invalidFields = Object.keys(result.errors);
        if (invalidFields.length > 0) {
          const now = Date.now();
          const timeSinceLastToast = now - lastToastTimeRef.current;
          
          if (timeSinceLastToast > 2000) {
            lastToastTimeRef.current = now;
            addToast({
              variant: 'error',
              title: 'Invalid Location Information',
              message: `Please check: ${invalidFields.join(', ')}`,
              duration: 5000,
            });
          }
        }
      }
    }
  }, [formData, validateLocation, addToast]);  const addressChange = useCallback(async (value: string) => {
    onUpdateField('address', value);
    clearValidationErrors();

    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    if (value.trim()) {
      setFieldLoadingStates(prev => ({ ...prev, address: true }));
      
    
      addressTimeoutRef.current = setTimeout(async () => {
        setFieldLoadingStates(prev => ({ ...prev, address: false }));
        await validateLocationFields({ address: value });
      }, 1500);
    } else {
      setFieldLoadingStates(prev => ({ ...prev, address: false }));
    }
  }, [onUpdateField, clearValidationErrors, validateLocationFields]);

  const stateChange = useCallback(async (value: string) => {
    onUpdateField('state', value); // value is already formatted as "State Name (AB)"
    onUpdateField('city', ''); // Reset city when state changes
    setCitySearch(''); // Reset city search
    setIsCityDropdownOpen(false); // Close city dropdown
    clearValidationErrors();
    
    // Don't validate immediately since city will be empty after state change
  }, [onUpdateField, clearValidationErrors]);

  const handleSelectCity = useCallback(async (value: string) => {
    onUpdateField('city', value);
    setCitySearch(''); // Clear search after selection
    setIsCityDropdownOpen(false); // Close dropdown after selection
    clearValidationErrors();
    
    await validateLocationFields({ city: value });
  }, [onUpdateField, clearValidationErrors, validateLocationFields]);

  const handleCitySearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCitySearch(e.target.value);
    if (!isCityDropdownOpen && e.target.value) {
      setIsCityDropdownOpen(true);
    }
  }, [isCityDropdownOpen]);

  const clearCitySearch = useCallback(() => {
    setCitySearch('');
    setIsCityDropdownOpen(false);
  }, []);


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
    ...(statesCities ? Object.entries(statesCities).map(([key, value]) => ({
      value: `${value.name} (${key})`,
      label: value.name
    })) : []).sort((a, b) => a.label.localeCompare(b.label))
  ];

  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
      if (cityTimeoutRef.current) {
        clearTimeout(cityTimeoutRef.current);
      }
      // Reset city search state on unmount
      setCitySearch('');
      setIsCityDropdownOpen(false);
    };
  }, []);

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
            error={!!validationErrors.address}
            hint={validationErrors.address}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">           
           <div>
            <Label>City *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => stateAbbr && !isLoadingCities && setIsCityDropdownOpen(!isCityDropdownOpen)}
                disabled={!stateAbbr || isLoadingCities}
                className={`w-full h-11 rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden text-left flex items-center justify-between disabled:bg-gray-50 disabled:text-gray-500 ${formData.city ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'} ${validationErrors.city ? 'border-red-500' : ''}`}
              >
                <span>{formData.city || (!stateAbbr ? "Select state first" : isLoadingCities ? "Loading cities..." : "Select City")}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCityDropdownOpen && stateAbbr && !isLoadingCities && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Type to search cities..."
                        value={citySearch}
                        onChange={handleCitySearchChange}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      {citySearch && (
                        <button
                          type="button"
                          onClick={clearCitySearch}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.slice(0, 100).map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleSelectCity(city)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {citySearch ? 'No cities found' : 'No cities available'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCityDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCityDropdownOpen(false)}
                />
              )}
            </div>
            {validationErrors.city && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
            )}
          </div><div>
            <Label>State/Province *</Label>
            <Select
              options={stateOptions}
              onChange={(value: string) => stateChange(value)}
              defaultValue={formData.state}
              disabled={isLoadingStates}
              placeholder={isLoadingStates ? "Loading states..." : "Select State"}
            />
          </div>          
          <div>
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
