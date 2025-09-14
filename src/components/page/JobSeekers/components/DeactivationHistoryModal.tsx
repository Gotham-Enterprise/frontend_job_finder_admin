"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import { useToast } from '@/context/ToastContext';
import { adminUserManagementApi, DeactivationHistoryEntry } from '@/services/api/adminUserManagement';
import { formatDateTimeEST } from '@/services/utils/dateUtils';

interface DeactivationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const DeactivationHistoryModal: React.FC<DeactivationHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [history, setHistory] = useState<DeactivationHistoryEntry[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    
    try {
      const response = await adminUserManagementApi.getUserDeactivationHistory(userId);
      setHistory(response.data.history);
      setUserInfo(response.data.user);
    } catch (error: any) {
      console.error('Error fetching deactivation history:', error);
      addToast({
        variant: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch deactivation history',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const formatted = formatDateTimeEST(dateString);
      if (typeof formatted === 'string') {
        return formatted;
      }
      return `${formatted.date} at ${formatted.time}`;
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  const getStatusBadge = (entry: DeactivationHistoryEntry) => {
    if (entry.reactivatedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Reactivated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Deactivated
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl mx-auto my-8 p-6 rounded-lg"
      isFullscreen={false}
    >
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deactivation History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete deactivation and reactivation history for {userName}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading history...</p>
            </div>
          </div>
        ) : (
          <>
            {userInfo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>{' '}
                    <span className="text-gray-900 dark:text-white">
                      {userInfo.firstName} {userInfo.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>{' '}
                    <span className="text-gray-900 dark:text-white">{userInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Current Status:</span>{' '}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userInfo.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {userInfo.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No deactivation history found for this user.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    History ({history.length} {history.length === 1 ? 'entry' : 'entries'})
                  </h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(entry)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Entry #{history.length - index}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(entry.deactivatedAt)}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Deactivation Info */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Deactivation Details
                            </h4>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                                  <p className="text-gray-900 dark:text-white mt-1">
                                    {entry.deactivationReason}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Deactivated by:</span>
                                  <p className="text-gray-900 dark:text-white mt-1">
                                    {entry.deactivatedByAdmin
                                      ? `${entry.deactivatedByAdmin.firstName} ${entry.deactivatedByAdmin.lastName} (${entry.deactivatedByAdmin.email})`
                                      : entry.isDeactivatedBySystem
                                      ? 'System'
                                      : 'Unknown'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reactivation Info */}
                          {entry.reactivatedAt && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Reactivation Details
                              </h4>
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                      {formatDate(entry.reactivatedAt)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Reactivated by:</span>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                      {entry.reactivatedByAdmin
                                        ? `${entry.reactivatedByAdmin.firstName} ${entry.reactivatedByAdmin.lastName} (${entry.reactivatedByAdmin.email})`
                                        : 'Unknown'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
