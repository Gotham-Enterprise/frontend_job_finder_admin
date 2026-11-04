"use client";
import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { OccupationItem } from '@/services/types/occupation';

interface DeleteOccupationModalProps {
  isOpen: boolean;
  onClose: () => void;
  occupation: OccupationItem | null;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export const DeleteOccupationModal: React.FC<DeleteOccupationModalProps> = ({
  isOpen,
  onClose,
  occupation,
  onConfirm,
  isLoading = false,
}) => {
  if (!occupation) return null;

  const jobCount = occupation.publishedJobCount || 0;
  const specialtyCount = occupation.specialty?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-md mx-auto mt-20 rounded-xl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Occupation
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{occupation.name}"
              </span>
              ? This action will disable it and remove it from active occupation dropdowns across the platform.
            </p>

            {(jobCount > 0 || specialtyCount > 0) && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                {jobCount > 0 && (
                  <p>
                    ⚠️ <strong>Notice:</strong> This occupation is associated with{' '}
                    <strong>{jobCount}</strong> published job post(s).
                  </p>
                )}
                {specialtyCount > 0 && (
                  <p>
                    ⚠️ <strong>Notice:</strong> This occupation currently has{' '}
                    <strong>{specialtyCount}</strong> associated specialization(s).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete Occupation'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

