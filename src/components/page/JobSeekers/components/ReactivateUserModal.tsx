"use client";
import React, { useState } from 'react';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import TextArea from '../../../form/input/TextArea';
import { useToast } from '@/context/ToastContext';
import { adminUserManagementApi } from '@/services/api/adminUserManagement';

interface ReactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export const ReactivateUserModal: React.FC<ReactivateUserModalProps> = ({
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
        message: 'Please provide a reason for reactivation',
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
      await adminUserManagementApi.reactivateUser(userId, { reason: reason.trim() });
      
      addToast({
        variant: 'success',
        title: 'User Reactivated',
        message: `${userName} has been successfully reactivated`,
        duration: 5000,
      });
      
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error reactivating user:', error);
      addToast({
        variant: 'error',
        title: 'Reactivation Failed',
        message: error.message || 'Failed to reactivate user. Please try again.',
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
            Reactivate User Account
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              You are about to reactivate the account for:
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userName}
            </p>
          </div>

          <div>
            <label
              htmlFor="reactivation-reason"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Reason for Reactivation <span className="text-red-500">*</span>
            </label>
            <TextArea
              placeholder="Please provide a detailed reason for reactivating this account..."
              value={reason}
              onChange={(value: string) => setReason(value)}
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {reason.length}/255 characters
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Account Reactivation
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    Reactivating this account will restore the user's access to the platform
                    and allow them to log in and use all features.
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
              variant="default"
              onClick={() => handleSubmit({} as React.FormEvent)}
              disabled={isLoading || !reason.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Reactivating...
                </div>
              ) : (
                'Reactivate Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
