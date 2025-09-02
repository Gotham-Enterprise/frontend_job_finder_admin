'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/services/types/auth';
import { useStates } from '@/services/hooks/useStates';
import { adminUsersApi } from '@/services/api/adminUsers';
import { authUtils } from '@/services/utils/authUtils';
import { showToast } from '@/services/utils/toast';
import { triggerAuthUpdate } from '@/hooks/useAuthStorage';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { PencilIcon, LockIcon, EyeIcon, EyeCloseIcon } from '@/icons';

interface PersonalInformationFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AccountInfoProps {
  user: User | null;
  userInitials: string;
  displayName: string;
  onPasswordChange: (data: PasswordFormData) => Promise<void>;
  onAvatarChange: (formData: FormData) => Promise<void>;
  onPersonalInfoChange: (data: PersonalInformationFormData) => Promise<void>;
  isChangingPassword: boolean;
  isUpdatingAvatar?: boolean;
  isUpdatingPersonalInfo?: boolean;
  refetchUser?: () => Promise<any>;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  user,
  userInitials,
  displayName,
  onPasswordChange,
  onAvatarChange,
  onPersonalInfoChange,
  isChangingPassword,
  isUpdatingAvatar = false,
  isUpdatingPersonalInfo = false,
  refetchUser
}) => {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { data: statesResponse, isLoading: isLoadingStates } = useStates();
  const states = statesResponse?.data?.states || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      const newFormData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phoneNumber: user.profile?.phoneNumber || '',
        address: user.profile?.address || '',
        state: user.profile?.state || '',
        city: user.profile?.city || '',
        zipCode: user.profile?.zipCode || ''
      };
      setEditFormData(newFormData);
    }
  }, [user]);

  // Also listen for changes to displayName and userInitials which come from authUtils
  useEffect(() => {
    // Force re-render when localStorage user data changes
    const handleStorageChange = () => {
      // This will trigger a re-render and update the displayed data
      setMounted(false);
      setTimeout(() => setMounted(true), 0);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const [editFormData, setEditFormData] = useState<PersonalInformationFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    phoneNumber: user?.profile?.phoneNumber || '',
    address: user?.profile?.address || '',
    state: user?.profile?.state || '',
    city: user?.profile?.city || '',
    zipCode: user?.profile?.zipCode || ''
  });
  
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const validatePasswordForm = useCallback(() => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      return { valid: false, message: 'All fields are required' };
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return { valid: false, message: 'New passwords do not match' };
    }
    
    if (passwordFormData.newPassword.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    return { valid: true, message: '' };
  }, [passwordFormData]);

  const submitPasswordChange = useCallback(async () => {
    const validation = validatePasswordForm();
    if (!validation.valid) {
      return;
    }

    try {
      await onPasswordChange(passwordFormData);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
    }
  }, [passwordFormData, validatePasswordForm, onPasswordChange]);

  const updateEditFormData = useCallback((updates: Partial<PersonalInformationFormData>) => {
    setEditFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePasswordFormData = useCallback((updates: Partial<PasswordFormData>) => {
    setPasswordFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const savePersonalInfo = useCallback(async () => {
    try {
      let response;
      

      if (selectedAvatar) {
        const formData = new FormData();
        formData.append('firstName', editFormData.firstName);
        formData.append('lastName', editFormData.lastName);
        formData.append('avatarUpload', selectedAvatar);
        
        response = await adminUsersApi.updatePersonalInfo(formData);
        showToast.success('Success', 'Personal information and avatar updated successfully!');
      } else {

        const personalInfoData = {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName
        };
        
        response = await adminUsersApi.updatePersonalInfo(personalInfoData);
        showToast.success('Success', 'Personal information updated successfully!');
      }


      const updatedUserData: Partial<User> = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName
      };
      
      if (response?.data?.avatarUrl) {
        updatedUserData.profile = {
          ...user?.profile,
          avatarUrl: response.data.avatarUrl,
          phoneNumber: user?.profile?.phoneNumber || null,
          address: user?.profile?.address || null,
          state: user?.profile?.state || null,
          city: user?.profile?.city || null,
          zipCode: user?.profile?.zipCode || null
        };
      }
      
      authUtils.updateUser(updatedUserData);

      triggerAuthUpdate();

      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      if (refetchUser) {
        await refetchUser();
      }

      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to save personal information:', error);
      showToast.error('Error', error?.message || 'Failed to update personal information');
      throw error; // Re-throw to let parent component handle the error display if needed
    }
  }, [editFormData, selectedAvatar, user?.profile, refetchUser]);

  const avatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const avatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast.error('Error', 'Please select an image file');
        return;
      }
      
      if (file.size > 1048576) {
        showToast.error('Error', 'File size must be less than 1MB');
        return;
      }

      setSelectedAvatar(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validation = validatePasswordForm();

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left side - Title and Description */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use a permanent address where you can receive mail.</p>
          </div>

          {/* Right side - Form */}
          <div className="lg:col-span-2">
            {/* Avatar Section */}
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : user?.profile?.avatarUrl ? (
                    <img 
                      src={user.profile.avatarUrl} 
                      alt="Current avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {mounted ? (userInitials || '?') : '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    onClick={avatarClick}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                  >
                    Change avatar
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. 1MB max.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={avatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => updateEditFormData({ firstName: e.target.value })}
                    className="mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => updateEditFormData({ lastName: e.target.value })}
                    className="mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => updateEditFormData({ email: e.target.value })}
                  disabled={true}
                  className="mt-1 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  value={user?.role || ''}
                  disabled={true}
                  className="mt-1 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                />
              </div>


            </div>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={savePersonalInfo}
                disabled={isUpdatingPersonalInfo}
              >
                {isUpdatingPersonalInfo ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left side - Title and Description */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your password associated with your account.</p>
          </div>

          {/* Right side - Form */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordFormData.currentPassword}
                    onChange={(e) => updatePasswordFormData({ currentPassword: e.target.value })}
                    className="pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.current ? (
                      <EyeCloseIcon  />
                    ) : (
                      <EyeIcon  />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordFormData.newPassword}
                    onChange={(e) => updatePasswordFormData({ newPassword: e.target.value })}
                    className="pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.new ? (
                      <EyeCloseIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => updatePasswordFormData({ confirmPassword: e.target.value })}
                    className="pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.confirm ? (
                      <EyeCloseIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={submitPasswordChange}
                disabled={!validation.valid || isChangingPassword}
              >
                {isChangingPassword ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
