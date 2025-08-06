'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { User } from '@/services/types/auth';
import { authUtils } from '@/services/utils/authUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { showToast } from '@/services/utils/toast';
import { useResetPassword, useUpdateProfile } from '@/services/hooks/useAuth';
import UserTable from './components/UserTable';
import AccountInfo from './components/AccountInfo';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountSettings: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const resetPasswordMutation = useResetPassword();
  const updateProfileMutation = useUpdateProfile();
  const currentUser = authUtils.getUser();
  const displayName = authUtils.getUserDisplayName();
  const userInitials = authUtils.getUserInitials();

  const testUser = currentUser || {
    id: 'test-user',
    email: 'admin@gothamenterprises.com',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    status: 'active'
  } as User;

  const executePasswordChange = useCallback(async (passwordData: PasswordFormData): Promise<void> => {
    setIsChangingPassword(true);
    
    try {
      const response = await resetPasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
 
      showToast.success('Success', 'Password changed successfully! You will be logged out.');

      setTimeout(() => {
        authUtils.clearAuthState();
        window.location.href = '/login';
      }, 2000);
      
    } catch (error: any) {
      console.error('Password change error:', error);
      showToast.error('Error', error?.message || 'Failed to change password');
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  }, [resetPasswordMutation]);

  const executeAvatarChange = useCallback(async (formData: FormData): Promise<void> => {
    setIsUpdatingAvatar(true);
    
    try {
  
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast.success('Success', 'Avatar updated successfully!');
      
    } catch (error: any) {
      console.error('Avatar update error:', error);
      showToast.error('Error', error?.message || 'Failed to update avatar');
      throw error;
    } finally {
      setIsUpdatingAvatar(false);
    }
  }, []);

  const executePersonalInfoChange = useCallback(async (formData: FormData): Promise<void> => {
    setIsUpdatingPersonalInfo(true);
    
    try {
      // Call the actual profile update API
      const response = await updateProfileMutation.mutateAsync(formData);
      
      showToast.success('Success', 'Profile updated successfully!');
      
      // Optionally update the current user in local state/storage
      // You might want to refresh user data here
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      showToast.error('Error', error?.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsUpdatingPersonalInfo(false);
    }
  }, [updateProfileMutation]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and user permissions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountInfo
              user={testUser}
              userInitials={userInitials}
              displayName={displayName}
              onPasswordChange={executePasswordChange}
              onAvatarChange={executeAvatarChange}
              onPersonalInfoChange={executePersonalInfoChange}
              isChangingPassword={isChangingPassword}
              isUpdatingAvatar={isUpdatingAvatar}
              isUpdatingPersonalInfo={isUpdatingPersonalInfo}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserTable />
          </TabsContent>
        </Tabs>
      </div>

      <FullScreenSpinner 
        isVisible={isChangingPassword} 
        message="Changing password, please wait..." 
      />
    </div>
  );
};

export default AccountSettings;