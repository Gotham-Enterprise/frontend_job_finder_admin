'use client';

import React, { useState, useCallback } from 'react';
import { User } from '@/services/types/auth';
import { CreateUserFormData, DEFAULT_PERMISSIONS } from '@/services/types/permissions';
import UserTable from './UserTable';
import PermissionProvider from '@/context/PermissionContext';

const MOCK_CURRENT_USER_PERMISSIONS = {
  tickets: { view: true, create: true, update: true, delete: true },
  jobSeekers: { view: true, create: true, update: true, delete: false },
  employers: { view: true, create: true, update: true, delete: false },
  applications: { view: true, create: false, update: true, delete: false },
  coupons: { view: true, create: true, update: true, delete: true },
  blog: { view: true, create: true, update: true, delete: false },
  careers: { view: true, create: false, update: false, delete: false },
};

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    suffix: null,
    salutation: null,
    role: 'admin',
    status: 'active',
    sendNewsLetter: true,
    failedLoginAttempts: 0,
    accountLocked: false,
    lockedUntil: null,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    recommendationFrequency: 'weekly',
    agreeToTermsAndConditions: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastEmailSentAt: null,
    userType: 'admin',
    forceChangePassword: false,
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    suffix: null,
    salutation: 'Ms.',
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
    recommendationFrequency: 'monthly',
    agreeToTermsAndConditions: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastEmailSentAt: null,
    userType: 'manager',
    forceChangePassword: false,
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    username: 'bobwilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    suffix: 'Jr.',
    salutation: 'Mr.',
    role: 'user',
    status: 'inactive',
    sendNewsLetter: true,
    failedLoginAttempts: 2,
    accountLocked: false,
    lockedUntil: null,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    recommendationFrequency: 'daily',
    agreeToTermsAndConditions: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastEmailSentAt: null,
    userType: 'standard',
    forceChangePassword: true,
  },
];

const UserManagementContainer: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const executeUserAction = useCallback((userId: string, action: 'manage' | 'remove') => {
    if (action === 'remove') {
      setUsers(prev => prev.filter(user => user.id !== userId));
    } else if (action === 'manage') {
      console.log('Managing user:', userId);
    }
  }, []);

  const createNewUser = useCallback(async (userData: CreateUserFormData) => {
    setIsCreatingUser(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.email.split('@')[0],
        firstName: userData.firstName,
        lastName: userData.lastName,
        suffix: null,
        salutation: null,
        role: userData.role,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEmailSentAt: null,
        userType: userData.role,
        forceChangePassword: false,
      };
      
      setUsers(prev => [...prev, newUser]);
      console.log('User created with permissions:', userData.permissions);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsCreatingUser(false);
    }
  }, []);

  return (
    <PermissionProvider userPermissions={MOCK_CURRENT_USER_PERMISSIONS}>
      <div className="p-6">
        <UserTable
          users={users}
          onUserAction={executeUserAction}
          onCreateUser={createNewUser}
          isCreatingUser={isCreatingUser}
        />
      </div>
    </PermissionProvider>
  );
};

export default UserManagementContainer;
