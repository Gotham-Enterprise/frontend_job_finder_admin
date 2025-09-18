"use client";
import React, { useState } from 'react';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import TextArea from '../../../form/input/TextArea';
import { useToast } from '@/context/ToastContext';
import { adminUserManagementApi } from '@/services/api/adminUserManagement';

interface DeactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      addToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Please provide a reason for deactivation',
        duration: 5000,
      });
      return;
    }

    if (reason.length > 255) {
      addToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Reason must not exceed 255 characters',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await adminUserManagementApi.deactivateUser(userId, { reason: reason.trim() });
      
      addToast({
        variant: 'success',
        title: 'User Deactivated',
        message: `${userName} has been successfully deactivated`,
        duration: 5000,
      });
      
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      addToast({
        variant: 'error',
        title: 'Deactivation Failed',
        message: error.message || 'Failed to deactivate user. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg mx-auto my-8 p-6 rounded-lg"
      isFullscreen={false}
    >
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deactivate User Account
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              You are about to deactivate the account for:
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userName}
            </p>
          </div>

          <div>
            <label
              htmlFor="deactivation-reason"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Reason for Deactivation <span className="text-red-500">*</span>
            </label>
            <TextArea
              placeholder="Please provide a detailed reason for deactivating this account..."
              value={reason}
              onChange={(value: string) => setReason(value)}
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {reason.length}/255 characters
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Deactivating this account will immediately prevent the user from logging in
                    and accessing the platform. This action can be reversed later if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmit({} as React.FormEvent)}
              disabled={isLoading || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deactivating...
                </div>
              ) : (
                'Deactivate Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
