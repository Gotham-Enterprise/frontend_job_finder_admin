'use client';

import React, { useState } from 'react';
import { User } from '@/services/types/auth';
import { authUtils } from '@/services/utils/authUtils';
import AvatarText from '@/components/ui/avatar/AvatarText';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { PencilIcon, LockIcon, EyeIcon, EyeCloseIcon } from '@/icons';
import { showToast } from '@/services/utils/toast';
import { useResetPassword } from '@/services/hooks/useAuth';
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
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
  });

  const resetPasswordMutation = useResetPassword();
  const currentUser = authUtils.getUser();
  


  const displayName = authUtils.getUserDisplayName();
  const userInitials = authUtils.getUserInitials();
  

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
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      showToast.error('Validation Error', 'All fields are required');
      return false;
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showToast.error('Validation Error', 'New passwords do not match');
      return false;
    }
    
    if (passwordFormData.newPassword.length < 8) {
      showToast.error('Validation Error', 'Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const savePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsPasswordModalOpen(false);
    setIsChangingPassword(true);
    
    try {
      const response = await resetPasswordMutation.mutateAsync({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
        confirmPassword: passwordFormData.confirmPassword
      });
 
      showToast.success('Success', 'Password changed successfully! You will be logged out.');
      
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({ current: false, new: false, confirm: false });

      setTimeout(() => {
        authUtils.clearAuthState();
        window.location.href = '/login';
      }, 2000);
      
    } catch (error: any) {
      console.error('Password change error:', error);
      

      setIsPasswordModalOpen(true);

      showToast.error('Error', error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const userAction = (userId: string, action: 'manage' | 'remove') => {
    console.log(`${action} user ${userId}`);
  };
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">            
          <ProfileInformation
              user={testUser}
              onEdit={editProfile}
              userInitials={userInitials}
              displayName={displayName}
            />

         
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security & Password</h2>                
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Password Update</Label>
                <p className="mt-1 text-gray-900 dark:text-white">30 days ago</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</Label>
                <p className="mt-1 text-gray-900 dark:text-white">2 hours ago</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <Button
                    onClick={changePassword}
                    variant="outline"
                    className="w-full justify-center text-center"
                  >
                    <LockIcon/>
                    Change Password
                  </Button>
                </div>
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
      
      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}      
        isFullscreen={false}
        className="max-w-2xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <LockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordFormData.currentPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                  className="pr-10"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.current ? (
                    <EyeCloseIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.new ? (
                    <EyeCloseIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.confirm ? (
                    <EyeCloseIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                className="dark:text-white"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setShowPasswords({ current: false, new: false, confirm: false });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={savePassword}
                disabled={!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword || passwordFormData.newPassword !== passwordFormData.confirmPassword || passwordFormData.newPassword.length < 8 || isChangingPassword}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      
      <FullScreenSpinner 
        isVisible={isChangingPassword} 
        message="Changing password, please wait..." 
      />
    </div>
  );
};

export default AccountSettings;