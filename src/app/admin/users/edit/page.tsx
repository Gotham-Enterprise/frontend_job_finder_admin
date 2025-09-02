'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpdateAdminUser, useAdminRoles, useAdminUsers } from '@/services/hooks/useAdminUsers';
import { UpdateAdminUserRequest, AdminUser } from '@/services/api/adminUsers';
import { CreateUserFormData } from '@/types/permissions';
import { showToast } from '@/services/utils/toast';
import { transformApiUserToFormData } from '@/services/utils/userUtils';
import EditUserForm from '@/components/page/EditUser';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  const { data: users = [] } = useAdminUsers();
  const { data: apiRoles = [] } = useAdminRoles();
  const updateUserMutation = useUpdateAdminUser();

  useEffect(() => {
    if (userId && users.length > 0) {
      const user = users.find(u => u.userId === userId);
      setSelectedUser(user || null);
    }
  }, [userId, users]);

  const getRoleId = useCallback((roleName: string): number => {
    const exactMatch = apiRoles.find(role => role.roleName === roleName);
    if (exactMatch) return exactMatch.id;
    
    const formValueMatch = apiRoles.find(role => 
      role.roleName.toLowerCase().replace(/\s+/g, '-') === roleName
    );
    if (formValueMatch) return formValueMatch.id;
    
    return apiRoles.length > 0 ? apiRoles[0].id : 1;
  }, [apiRoles]);

  const updateUser = useCallback(async (userData: CreateUserFormData) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    try {
      const access: any = {};
      
      const keyToApiNameMap: { [key: string]: string } = {
        'tickets': 'Tickets',
        'jobSeekers': 'Job Seekers',
        'employers': 'Employers',
        'applications': 'Applications',
        'coupons': 'Coupons',
        'blog': 'Blog',
        'careers': 'Careers',
        'jobs': 'Jobs',
      };
      
      Object.keys(userData.permissions).forEach(permissionKey => {
        const apiModuleName = keyToApiNameMap[permissionKey] || permissionKey;
        const permissions = userData.permissions[permissionKey];
        
        access[apiModuleName] = {
          add: permissions?.add || false,
          edit: permissions?.edit || false,
          view: permissions?.view || false,
          delete: permissions?.delete || false,
        };
      });

      const apiData: UpdateAdminUserRequest = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        roleId: getRoleId(userData.role),
        access,
      };

      await updateUserMutation.mutateAsync({ userId: selectedUser.userId, userData: apiData });
      
      showToast.success('Success', 'User updated successfully!');
      router.push('/admin/account-settings?tab=users');
      
    } catch (error: any) {
      console.error('Update user error:', error);
      showToast.error('Error', error?.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, updateUserMutation, getRoleId, router]);

  const cancelEdit = useCallback(() => {
    router.push('/admin/account-settings?tab=users');
  }, [router]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            User ID Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please provide a user ID to edit.
          </p>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!selectedUser && users.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The user with ID "{userId}" could not be found.
          </p>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FullScreenSpinner 
        isVisible={isLoading || updateUserMutation.isPending}
        message="Updating user..."
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-8xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Users
              </button>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit User
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {selectedUser ? `Update ${selectedUser.name}'s information and permissions` : 'Loading user information...'}
            </p>
          </div>

          {selectedUser ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <EditUserForm
                onSubmit={updateUser}
                onCancel={cancelEdit}
                isLoading={isLoading || updateUserMutation.isPending}
                userData={selectedUser}
                apiRoles={apiRoles}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
