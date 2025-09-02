'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authUtils } from '@/services/utils/authUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { showToast } from '@/services/utils/toast';
import { useResetPassword, useCurrentUser } from '@/services/hooks/useAuth';
import { useAuthStorage } from '@/hooks/useAuthStorage';
import UserTable from './components/UserTable';
import AccountInfo from './components/AccountInfo';

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
  phoneNumber: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
}

const AccountSettings: React.FC = () => {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] = useState(false);

  const { data: apiUser, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useCurrentUser();
  
  const authStorageData = useAuthStorage();

  useEffect(() => {
    setMounted(true);
    
 
    const tab = searchParams.get('tab');
    if (tab && (tab === 'account' || tab === 'users')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const resetPasswordMutation = useResetPassword();
  

  const currentUser = (apiUser as any)?.data || (apiUser as any)?.user || apiUser || authStorageData.user;
  const [displayName, setDisplayName] = useState(authStorageData.displayName);
  const [userInitials, setUserInitials] = useState(authStorageData.userInitials);

  useEffect(() => {
    setDisplayName(authStorageData.displayName);
    setUserInitials(authStorageData.userInitials);
  }, [authStorageData]);


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

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success('Success', 'Personal information updated successfully!');
      
   
      await refetchUser();
      
    } catch (error: any) {
      console.error('Personal info update error:', error);
      showToast.error('Error', error?.message || 'Failed to update personal information');
      throw error;
    } finally {
      setIsUpdatingPersonalInfo(false);
    }
  }, [refetchUser]);


  if (!mounted || isLoadingUser) {
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

  // Show error state if user fetch failed
  if (userError && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to load user data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Unable to fetch current user information from the server.
            </p>
            <button
              onClick={() => refetchUser()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
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
              user={currentUser}
              userInitials={userInitials}
              displayName={displayName}
              onPasswordChange={executePasswordChange}
              onAvatarChange={executeAvatarChange}
              onPersonalInfoChange={executePersonalInfoChange}
              isChangingPassword={isChangingPassword}
              isUpdatingAvatar={isUpdatingAvatar}
              isUpdatingPersonalInfo={isUpdatingPersonalInfo}
              refetchUser={refetchUser}
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