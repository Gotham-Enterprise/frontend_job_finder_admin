"use client";

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStates } from '@/services/hooks/useStates';
import { teamApi } from '@/services/api/team';
import { TeamMember } from '@/services/types/team';
import { teamQueryKeys } from '@/services/hooks/useTeam';
import { showToast } from '@/services/utils/toast';
import { validateTeamMemberForm, TeamMemberFormData } from '@/validation/teamMemberValidation';
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

// Use the type from our validation file
type FormData = TeamMemberFormData;

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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  const { data: statesData } = useStates();

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

      if (teamMember.profilePicture || teamMember.avatarUrl) {
        setPreviewUrl(teamMember.profilePicture || teamMember.avatarUrl || null);
      }
    } else if (isOpen) {
      setFormData({
        ...initialFormData,
        country: 'USA'
      });
    }
  }, [teamMember, isOpen]);

  const stateOptions = React.useMemo(() => {
    if (!statesData?.data?.states) return [];
    return statesData.data.states.map(state => ({
      value: state.name,
      label: state.name
    }));
  }, [statesData]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const onInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field, e.target.value);
  };

  const onSelectChange = (field: keyof FormData) => (value: string) => {
    updateField(field, value);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };


  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const validateForm = (): boolean => {
    const result = validateTeamMemberForm(formData);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  const submitForm = async (e: React.FormEvent) => {
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
        } else if (key === 'country') {

          submitFormData.append('country', value || 'USA');
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
      
      closeModal();
      
    } catch (error: any) {
      console.error('Error updating team member:', error);
      
      let errorMessage = 'Failed to update team member. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Failed to Update Team Member', errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setFormData(initialFormData);
    setProfileFile(null);
    if (previewUrl?.startsWith('blob:')) {
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
    <Modal isOpen={isOpen} onClose={closeModal} isFullscreen={false} className="max-w-2xl mx-4 my-8 rounded-xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Team Member</h2>
        
        <form onSubmit={submitForm} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors overflow-hidden relative"
              onClick={openFileDialog}
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
                onChange={onFileSelect}
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
                onChange={onInputChange('firstName')}
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
                onChange={onInputChange('lastName')}
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
              onChange={onInputChange('email')}
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
              onChange={onSelectChange('companyRole')}
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
              onChange={onSelectChange('accessRoleId')}
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
              onChange={onInputChange('address')}
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
                onChange={onInputChange('city')}
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
                onChange={onSelectChange('state')}
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
                placeholder="United States"
                value={formData.country || 'USA'}
                disabled
                onChange={onSelectChange('country')}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code*</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={onInputChange('zipCode')}
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
              onClick={closeModal}
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
