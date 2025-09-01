"use client";

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStates } from '@/services/hooks/useStates';
import { teamApi } from '@/services/api/team';
import { TeamMember } from '@/services/types/team';
import { teamQueryKeys } from '@/services/hooks/useTeam';
import { showToast } from '@/services/utils/toast';
import { authUtils } from '@/services/utils/authUtils';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  teamMember: TeamMember | null;
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

export default function EditTeamMemberModal({ isOpen, onClose, employerId, teamMember }: EditTeamMemberModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  const { data: statesData, isLoading: isStatesLoading } = useStates();

  // Populate form with team member data when modal opens
  useEffect(() => {
    if (teamMember && isOpen) {
      setFormData({
        firstName: teamMember.firstName || '',
        lastName: teamMember.lastName || '',
        email: teamMember.email || '',
        companyRole: teamMember.companyRole || '',
        accessRoleId: teamMember.accessRoleId?.toString() || '',
        address: teamMember.address || '',
        city: teamMember.city || '',
        state: teamMember.state || '',
        country: teamMember.country || 'USA',
        zipCode: teamMember.zipCode || '',
      });
      
      // Set preview URL if team member has profile picture
      if (teamMember.profilePicture || teamMember.avatarUrl) {
        setPreviewUrl(teamMember.profilePicture || teamMember.avatarUrl || null);
      }
    }
  }, [teamMember, isOpen]);

  // Create state options from API data
  const stateOptions = React.useMemo(() => {
    if (!statesData?.data?.states) return [];
    return statesData.data.states.map(state => ({
      value: state.name,
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
      if (previewUrl && previewUrl.startsWith('blob:')) {
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
    
    if (!validateForm() || !teamMember) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
    
      if (profileFile) {
        submitFormData.append('uploadProfileUser', profileFile);
      }
      

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'accessRoleId') {
       
          submitFormData.append('accessRoleId', value.toString());
     
          submitFormData.append('country', value || 'United States');
        } else {
          submitFormData.append(key, value.toString());
        }
      });

   


      const teamMemberId = teamMember.userId || teamMember.id;
      if (!teamMemberId) {
        throw new Error('Team member ID is required for update');
      }

   
      await teamApi.updateTeamMember(employerId, teamMemberId, submitFormData);
      
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.list(employerId) });
      
 
      showToast.success('Team Member Updated', 'Team member details have been successfully updated.');
      

      handleClose();
      
    } catch (error: any) {
      console.error('Error updating team member:', error);
      
      // Show error message to user
      let errorMessage = 'Failed to update team member. Please try again.';
      
      if (error.response) {
     
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
      
      showToast.error('Failed to Update Team Member', errorMessage);
      
    
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setProfileFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Team Member</h2>
        
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
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to change profile picture</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
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
              <p className="text-sm text-error-500 mt-1">{errors.companyRole}</p>
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
              <p className="text-sm text-error-500 mt-1">{errors.accessRoleId}</p>
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
                placeholder="Select State"
                value={formData.state}
                onChange={handleSelectChange('state')}
                className={errors.state ? 'border-error-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-error-500 mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Country and Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country*</Label>
              <Select
                options={countryOptions}
                placeholder="Select Country"
                value={formData.country}
                disabled
                onChange={handleSelectChange('country')}
              />
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
