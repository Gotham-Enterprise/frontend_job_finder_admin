"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { teamApi } from '@/services/api/team';
import { useQueryClient } from '@tanstack/react-query';
import { teamQueryKeys } from '@/services/hooks/useTeam';
import { useStates } from '@/services/hooks/useStates';
import { showToast } from '@/services/utils/toast';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  companyRole: string;
  accessRoleId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  companyRole: '',
  accessRoleId: '',
  address: '',
  city: '',
  state: '',
  country: 'USA',
  zipCode: '',
};

const countryOptions = [
  { value: 'USA', label: 'United States' },
];

const accessRoleOptions = [
  { value: '1', label: 'Super Admin' },
  { value: '2', label: 'Admin' },
  { value: '3', label: 'Billing Manager' },
  { value: '4', label: 'Recruiter' },
];

const companyRoleOptions = [
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Director', label: 'Director' },
  { value: 'HR Manager', label: 'HR Manager' },
  { value: 'Office Manager', label: 'Office Manager' },
  { value: 'Owner', label: 'Owner' },
  { value: 'President', label: 'President' },
  { value: 'Recruiter', label: 'Recruiter' },
];

export default function AddTeamMemberModal({ isOpen, onClose, employerId }: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  const { data: statesData, isLoading: isStatesLoading } = useStates();

  // Create state options from API data
  const stateOptions = React.useMemo(() => {
    if (!statesData?.data?.states) return [];
    return statesData.data.states.map(state => ({
      value: state.name, // Use state name instead of abbreviation for consistency
      label: state.name
    }));
  }, [statesData]);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup preview URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.companyRole.trim()) {
      newErrors.companyRole = 'Company role is required';
    }
    
    if (!formData.accessRoleId) {
      newErrors.accessRoleId = 'Access role is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City name must be at least 2 characters';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      
      // Add profile picture if selected
      if (profileFile) {
        submitFormData.append('uploadProfileUser', profileFile);
      }
      
      // Add all form fields with proper formatting
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'accessRoleId') {
          // Convert accessRoleId to number for backend
          submitFormData.append('accessRoleId', value.toString());
        } else if (key === 'country') {
          // Make sure country is set correctly
          submitFormData.append('country', value || 'United States');
        } else {
          submitFormData.append(key, value.toString());
        }
      });

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('Submitting to employer ID:', employerId);
      console.log('API endpoint:', `/api/admin/employer/users/${employerId}`);

      await teamApi.addTeamMember(employerId, submitFormData);
      
      // Invalidate and refetch team members
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.list(employerId) });
      
      // Show success message
      showToast.success('Team Member Added', 'Team member has been successfully added to the organization.');
      
      // Reset form and close modal
      setFormData(initialFormData);
      setProfileFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
      
    } catch (error: any) {
      console.error('Error adding team member:', error);
      
      // Show error message to user
      let errorMessage = 'Failed to add team member. Please try again.';
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Extract specific error message from response
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      showToast.error('Failed to Add Team Member', errorMessage);
      
      // Log the form data for debugging
      console.log('Form data sent:', {
        employerId,
        formData,
        hasProfileFile: !!profileFile
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setProfileFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isFullscreen={false} className="max-w-2xl mx-4 my-8 rounded-xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors overflow-hidden relative"
              onClick={handleCameraClick}
              title="Click to upload profile picture"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div>
              <Label className="text-gray-600">Add company logo (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {profileFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {profileFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name*</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                hint={errors.firstName}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name*</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                hint={errors.lastName}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address*</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              hint={errors.email}
            />
          </div>

          {/* Company Role */}
          <div>
            <Label htmlFor="companyRole">Company Role*</Label>
            <Select
              options={companyRoleOptions}
              placeholder="Enter your company role"
              value={formData.companyRole}
              onChange={handleSelectChange('companyRole')}
              className={errors.companyRole ? 'border-error-500' : ''}
            />
            {errors.companyRole && (
              <p className="mt-1.5 text-xs text-error-500">{errors.companyRole}</p>
            )}
          </div>

          {/* Access Role */}
          <div>
            <Label htmlFor="accessRole">Access Role*</Label>
            <Select
              options={accessRoleOptions}
              placeholder="Enter your access role"
              value={formData.accessRoleId}
              onChange={handleSelectChange('accessRoleId')}
              className={errors.accessRoleId ? 'border-error-500' : ''}
            />
            {errors.accessRoleId && (
              <p className="mt-1.5 text-xs text-error-500">{errors.accessRoleId}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address*</Label>
            <Input
              id="address"
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!errors.address}
              hint={errors.address}
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={!!errors.city}
                hint={errors.city}
              />
            </div>
            <div>
              <Label htmlFor="state">State*</Label>
              <Select
                options={stateOptions}
                placeholder={isStatesLoading ? "Loading states..." : "State"}
                value={formData.state}
                onChange={handleSelectChange('state')}
                className={errors.state ? 'border-error-500' : ''}
                disabled={isStatesLoading}
              />
              {errors.state && (
                <p className="mt-1.5 text-xs text-error-500">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Country and Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country*</Label>
              <Select
                options={countryOptions}
                placeholder="Country"
                value={formData.country}
                onChange={handleSelectChange('country')}
                className={errors.country ? 'border-error-500' : ''}
                disabled={true}
              />
              {errors.country && (
                <p className="mt-1.5 text-xs text-error-500">{errors.country}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code*</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange('zipCode')}
                error={!!errors.zipCode}
                hint={errors.zipCode}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-400 hover:bg-gray-500"
            >
              {isSubmitting ? 'Adding...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
