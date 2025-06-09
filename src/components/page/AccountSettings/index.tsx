'use client';

import React, { useState } from 'react';
import { User } from '@/services/types/auth';
import { authUtils } from '@/services/utils/authUtils';
import AvatarText from '@/components/ui/avatar/AvatarText';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import { PencilIcon } from '@/icons';
import UserTable from './components/UserTable';
import ProfileInformation from './components/ProfileInformation';

const getUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

const getUserInitials = (user: User): string => {
  const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
  
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  return firstInitial || lastInitial || user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
};

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

const AccountSettings: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobPosition: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });  const currentUser = authUtils.getUser();
  
  // Debug logging (remove in production)
  console.log('Current user:', currentUser);
  
  // Use authUtils methods for better fallback handling
  const displayName = authUtils.getUserDisplayName();
  const userInitials = authUtils.getUserInitials();
  
  // Debug logging (remove in production)
  console.log('Display name:', displayName);
  console.log('User initials:', userInitials);

  // Fallback user data for testing when no user is logged in
  const testUser = currentUser || {
    id: 'test-user',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    status: 'active'
  } as User;
  const editProfile = () => {
    if (testUser) {
      setEditFormData({
        firstName: testUser.firstName || '',
        lastName: testUser.lastName || '',
        email: testUser.email || '',
        phone: '', 
        jobPosition: testUser.role || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const saveProfile = () => {
    console.log('Saving profile:', editFormData);
    setIsEditModalOpen(false);
  };

  const changePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const savePassword = () => {
    console.log('Changing password');
    setIsPasswordModalOpen(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };  const userAction = (userId: string, action: 'manage' | 'remove') => {
    console.log(`${action} user ${userId}`);
  };
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">            <ProfileInformation
              user={testUser}
              onEdit={editProfile}
              userInitials={userInitials}
              displayName={displayName}
            />

         
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Details</h2>                
              <Button
                onClick={changePassword}
                variant="ghost"
                size="sm"
                className="px-4 py-2 dark:text-white whitespace-nowrap text-primary flex items-center"
              >
                <PencilIcon className="flex-shrink-0" />
                Change Password
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Password Update</Label>
                <p className="mt-1 text-gray-900 dark:text-white">30 days ago</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</Label>
                <p className="mt-1 text-gray-900 dark:text-white">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>      
          {/* Right Column - Users Management Table */}
        <div className="lg:col-span-2">
          <UserTable users={mockUsers} onUserAction={userAction} />
        </div>
      </div>
      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}      
          isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          
            
            <div>
              <Label htmlFor="jobPosition">Job Position</Label>
              <Input
                id="jobPosition"
                type="text"
                value={editFormData.jobPosition}
                onChange={(e) => setEditFormData({ ...editFormData, jobPosition: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                 className="dark:text-white"
              >
                Cancel
              </Button>
              <Button onClick={saveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>    
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}      
         isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900  dark:text-white mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordFormData.currentPassword}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordFormData.newPassword}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordFormData.confirmPassword}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                className="dark:text-white"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={savePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettings;