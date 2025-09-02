'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAdminUser, useAdminRoles } from '@/services/hooks/useAdminUsers';
import { CreateAdminUserRequest } from '@/services/api/adminUsers';
import { CreateUserFormData } from '@/types/permissions';
import { showToast } from '@/services/utils/toast';
import CreateUserForm from '@/components/page/CreateUser';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: apiRoles = [] } = useAdminRoles();
  const createUserMutation = useCreateAdminUser();

  const getRoleId = useCallback((roleName: string): number => {
    const exactMatch = apiRoles.find(role => role.roleName === roleName);
    if (exactMatch) return exactMatch.id;
    
    const formValueMatch = apiRoles.find(role => 
      role.roleName.toLowerCase().replace(/\s+/g, '-') === roleName
    );
    if (formValueMatch) return formValueMatch.id;
    
    return apiRoles.length > 0 ? apiRoles[0].id : 1;
  }, [apiRoles]);

  const createUser = useCallback(async (userData: CreateUserFormData) => {
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

      const apiData: CreateAdminUserRequest = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        roleId: getRoleId(userData.role),
        access,
      };

      await createUserMutation.mutateAsync(apiData);
      
      showToast.success('Success', 'User created successfully!');
      router.push('/admin/account-settings?tab=users');
      
    } catch (error: any) {
      console.error('Create user error:', error);
      showToast.error('Error', error?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  }, [createUserMutation, getRoleId, router]);

  const cancelCreate = useCallback(() => {
    router.push('/admin/account-settings?tab=users');
  }, [router]);

  return (
    <>
      <FullScreenSpinner 
        isVisible={isLoading || createUserMutation.isPending}
        message="Creating user..."
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-8xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={cancelCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Users
              </button>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New User
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new user to the system with specific access permissions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CreateUserForm
              onSubmit={createUser}
              onCancel={cancelCreate}
              isLoading={isLoading || createUserMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
