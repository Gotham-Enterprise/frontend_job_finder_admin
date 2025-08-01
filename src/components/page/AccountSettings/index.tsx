'use client';

import React, { useState, useCallback } from 'react';
import { User } from '@/services/types/auth';
import { authUtils } from '@/services/utils/authUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { showToast } from '@/services/utils/toast';
import { useResetPassword } from '@/services/hooks/useAuth';
import UserTable from './components/UserTable';
import AccountInfo from './components/AccountInfo';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@company.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    suffix: null,
    salutation: null,
    role: 'admin',
    status: 'active',
    sendNewsLetter: false,
    failedLoginAttempts: 0,
    accountLocked: false,
    lockedUntil: null,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    recommendationFrequency: 'weekly',
    agreeToTermsAndConditions: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastEmailSentAt: null,
    userType: 'admin',
    forceChangePassword: false
  },
  {
    id: '2',
    email: 'jane.smith@company.com',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    suffix: null,
    salutation: null,
    role: 'manager',
    status: 'active',
    sendNewsLetter: false,
    failedLoginAttempts: 0,
    accountLocked: false,
    lockedUntil: null,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    recommendationFrequency: 'weekly',
    agreeToTermsAndConditions: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastEmailSentAt: null,
    userType: 'manager',
    forceChangePassword: false
  },
  {
    id: '3',
    email: 'bob.wilson@company.com',
    username: 'bobwilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    suffix: null,
    salutation: null,
    role: 'user',
    status: 'inactive',
    sendNewsLetter: false,
    failedLoginAttempts: 0,
    accountLocked: false,
    lockedUntil: null,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    recommendationFrequency: 'weekly',
    agreeToTermsAndConditions: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastEmailSentAt: null,
    userType: 'user',
    forceChangePassword: false
  }
];

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PersonalInformationFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] = useState(false);

  const resetPasswordMutation = useResetPassword();
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

  const executePersonalInfoChange = useCallback(async (personalData: PersonalInformationFormData): Promise<void> => {
    setIsUpdatingPersonalInfo(true);
    
    try {
      // Simulate API call for personal info update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success('Success', 'Personal information updated successfully!');
      
    } catch (error: any) {
      console.error('Personal info update error:', error);
      showToast.error('Error', error?.message || 'Failed to update personal information');
      throw error;
    } finally {
      setIsUpdatingPersonalInfo(false);
    }
  }, []);

  const executeUserAction = useCallback((userId: string, action: 'manage' | 'remove') => {
    console.log(`${action} user ${userId}`);
    showToast.info('Action', `User ${action} action triggered for user ${userId}`);
  }, []);

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
            <UserTable 
              users={mockUsers} 
              onUserAction={executeUserAction} 
            />
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