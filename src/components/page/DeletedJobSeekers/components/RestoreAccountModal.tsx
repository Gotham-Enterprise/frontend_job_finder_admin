import React, { useState } from 'react';
import { ArrowUpIcon, CloseIcon, LockIcon } from '@/icons';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import Label from '../../../form/Label';
import { RestoreAccountModalProps } from '@/services/types/deletedJobSeekers';

const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({
  isOpen,
  onClose,
  deletedAccount,
  onRestore,
  isRestoring,
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword.trim()) {
      setError('Admin password is required');
      return;
    }

    if (!deletedAccount) {
      setError('No account selected');
      return;
    }

    try {
      setError('');
      await onRestore(deletedAccount.id, adminPassword);
      setAdminPassword('');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to restore account');
    }
  };

  const handleClose = () => {
    setAdminPassword('');
    setError('');
    onClose();
  };

  if (!deletedAccount) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-md border shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Restore Account
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore permanently deleted job seeker account
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Account to Restore
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {deletedAccount.originalFirstName} {deletedAccount.originalLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Original Email:</span>
              <span className="text-gray-900 dark:text-white">
                {deletedAccount.originalEmail}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Username:</span>
              <span className="text-gray-900 dark:text-white">
                {deletedAccount.originalUsername}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Deleted:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(deletedAccount.deletedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Applications:</span>
              <span className="text-gray-900 dark:text-white">
                {deletedAccount.totalApplicationsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">
              ⚠️
            </div>
            <div className="text-sm">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                Important: Account Restoration
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-xs">
                <li>• This will restore all original user data and settings</li>
                <li>• The account will become active and accessible again</li>
                <li>• All applications will be restored with original status</li>
                <li>• This action will be logged for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="adminPassword">
              Admin Password *
            </Label>
            <div className="relative">
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="pl-10"
                required
              />
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your admin password is required to confirm this restoration
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              disabled={isRestoring || !adminPassword.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isRestoring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <ArrowUpIcon className="w-4 h-4 mr-2" />
                  Restore Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RestoreAccountModal;
