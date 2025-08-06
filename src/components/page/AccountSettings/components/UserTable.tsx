'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAdminUsers, useDeleteAdminUsers, useUpdateAdminUser, useCreateAdminUser, useAdminRoles, useCreateRole } from '@/services/hooks/useAdminUsers';
import { AdminUser, CreateAdminUserRequest, UpdateAdminUserRequest } from '@/services/api/adminUsers';
import { getUserInitials, formatUserRole, getUserStatusVariant, getRoleColor, transformApiUserToFormData } from '@/services/utils/userUtils';
import UserForm from './UserForm';
import Drawer from '@/components/ui/drawer/Drawer';
import { Modal } from '@/components/ui/modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import BulkActionDropdown from '@/components/ui/BulkActionDropdown';
import { CreateUserFormData } from '@/types/permissions';

const UserTable: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    value: '',
    label: ''
  });

  const { data: users = [], isLoading, error, refetch } = useAdminUsers();
  const { data: apiRoles = [] } = useAdminRoles();
  const deleteUsersMutation = useDeleteAdminUsers();
  const updateUserMutation = useUpdateAdminUser();
  const createUserMutation = useCreateAdminUser();
  const createRoleMutation = useCreateRole();

  // Debug logging
  console.log('UserTable Debug:', { users, isLoading, error });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const memoizedUsers = useMemo(() => users, [users]);

  const toggleAllUsers = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.userId));
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openEditDrawer = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    setSelectedUser(null);
    setIsEditDrawerOpen(false);
  };

  // Map role names to role IDs dynamically
  const getRoleId = useCallback((roleName: string): number => {
    // First try to find by exact role name
    const exactMatch = apiRoles.find(role => role.roleName === roleName);
    if (exactMatch) return exactMatch.id;
    
    // Then try to find by converted form value
    const formValueMatch = apiRoles.find(role => 
      role.roleName.toLowerCase().replace(/\s+/g, '-') === roleName
    );
    if (formValueMatch) return formValueMatch.id;
    
    // Default to first role if available, otherwise 1
    return apiRoles.length > 0 ? apiRoles[0].id : 1;
  }, [apiRoles]);

  // Handle user creation
  const handleCreateUser = useCallback(async (userData: CreateUserFormData) => {
    try {
      // Transform form data to API format dynamically
      const access: any = {};
      
      // Map form permission keys to API module names
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
      
      // Process each permission module dynamically
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
        roleId: getRoleId(userData.role), // Use the correct role ID mapping
        access,
      };

      await createUserMutation.mutateAsync(apiData);
      setIsCreateDrawerOpen(false);
    } catch (error) {
      console.error('Create user error:', error);
    }
  }, [createUserMutation]);

  // Handle user update
  const handleUpdateUser = useCallback(async (userData: CreateUserFormData) => {
    if (!selectedUser) return;

    try {
      console.log('Update user - incoming userData:', userData);
      
      // Transform form data to API format dynamically
      const access: any = {};
      
      // Map form permission keys to API module names
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
      
      // Process each permission module dynamically
      Object.keys(userData.permissions).forEach(permissionKey => {
        const apiModuleName = keyToApiNameMap[permissionKey] || permissionKey;
        const permissions = userData.permissions[permissionKey];
        
        console.log(`Processing permission: ${permissionKey} -> ${apiModuleName}`, permissions);
        
        access[apiModuleName] = {
          add: permissions?.add || false,
          edit: permissions?.edit || false,
          view: permissions?.view || false,
          delete: permissions?.delete || false,
        };
      });

      console.log('Final API access object for update:', access);

      const apiData: UpdateAdminUserRequest = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        roleId: getRoleId(userData.role), // Use the correct role ID mapping
        access,
      };

      await updateUserMutation.mutateAsync({ userId: selectedUser.userId, userData: apiData });
      closeEditDrawer();
    } catch (error) {
      console.error('Update user error:', error);
    }
  }, [selectedUser, updateUserMutation]);

  const handleBulkAction = (action: string) => {
    if (action === 'delete' && selectedUsers.length > 0) {
      setIsDeleteModalOpen(true);
    }
  };

  const openDeleteModal = () => {
    if (selectedUsers.length > 0) {
      setIsDeleteModalOpen(true);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openRoleModal = () => {
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setNewRoleData({ value: '', label: '' });
  };

  const handleCreateRole = useCallback(async () => {
    if (!newRoleData.label.trim()) {
      return;
    }

    try {
      // Call the API to create the role
      const response = await createRoleMutation.mutateAsync({
        roleName: newRoleData.label.trim()
      });

      if (response.success) {
        // Close modal and reset form
        setIsRoleModalOpen(false);
        setNewRoleData({ value: '', label: '' });
        // Note: The role will be available on next form load through refetch
      }
    } catch (error) {
      console.error('Role creation error:', error);
    }
  }, [newRoleData, createRoleMutation]);

  const confirmDeleteUsers = async () => {
    try {
      await deleteUsersMutation.mutateAsync(selectedUsers);
      setSelectedUsers([]);
      closeDeleteModal();
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  };

  const refreshData = () => {
    refetch();
    setSelectedUsers([]);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-8">
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load users</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Users Management
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {users.length} total users
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BulkActionDropdown
                selectedItems={selectedUsers}
                itemType="users"
                onBulkDelete={() => setIsDeleteModalOpen(true)}
                onClearSelection={() => setSelectedUsers([])}
                isDeleting={deleteUsersMutation.isPending}
              />
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleAllUsers}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {memoizedUsers.map((user) => {
                const statusVariant = getUserStatusVariant(user.status);
                const roleColorClass = getRoleColor(user.role);
                
                return (
                  <tr 
                    key={user.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => toggleUserSelection(user.userId)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {mounted ? getUserInitials(user.name) : '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColorClass}`}>
                        {formatUserRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusVariant.className}`}>
                        {statusVariant.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Manage
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUsers([user.userId]);
                            openDeleteModal();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first user.
            </p>
          </div>
        )}
      </div>

      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Add New User"
        width="xl"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateDrawerOpen(false)}
          isLoading={createUserMutation.isPending}
          onCreateRoleClick={openRoleModal}
        />
      </Drawer>

      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={closeEditDrawer}
        title="Edit User"
        width="xl"
      >
        {selectedUser && (
          <UserForm
            onSubmit={handleUpdateUser}
            onCancel={closeEditDrawer}
            isLoading={updateUserMutation.isPending}
            isEditMode={true}
            userId={selectedUser.userId}
            userData={selectedUser}
            onCreateRoleClick={openRoleModal}
          />
        )}
      </Drawer>

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUsers}
        onCancel={closeDeleteModal}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteUsersMutation.isPending}
      />

      {/* Create Role Modal - Centered in body DOM */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        isFullscreen={false}
        className="max-w-lg mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleLabel">Role Name *</Label>
              <Input
                id="roleLabel"
                type="text"
                placeholder="e.g., Content Editor"
                value={newRoleData.label}
                onChange={(e) => setNewRoleData(prev => ({ 
                  ...prev, 
                  label: e.target.value,
                  value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                }))}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={closeRoleModal}
                disabled={createRoleMutation.isPending}
                className="dark:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRole}
                disabled={!newRoleData.label.trim() || createRoleMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default React.memo(UserTable);
