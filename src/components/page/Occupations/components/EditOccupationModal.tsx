"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import { OccupationItem } from '@/services/types/occupation';

interface EditOccupationModalProps {
  isOpen: boolean;
  onClose: () => void;
  occupation: OccupationItem | null;
  onSubmit: (id: number, data: { name: string; isDropdown?: boolean }) => Promise<void> | void;
  isLoading?: boolean;
}

export const EditOccupationModal: React.FC<EditOccupationModalProps> = ({
  isOpen,
  onClose,
  occupation,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [isDropdown, setIsDropdown] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && occupation) {
      setName(occupation.name || '');
      setIsDropdown(occupation.isDropdown !== false);
      setError('');
    }
  }, [isOpen, occupation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occupation) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Occupation name is required');
      return;
    }
    setError('');
    await onSubmit(occupation.id, { name: trimmed, isDropdown });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-md mx-auto mt-20 rounded-xl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Occupation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="edit-occupation-name">
              Occupation Name <span className="text-error-500">*</span>
            </Label>
            <Input
              id="edit-occupation-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              error={Boolean(error)}
              hint={error}
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDropdown}
                onChange={(e) => setIsDropdown(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show in dropdowns (isDropdown)
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-6.5">
              When enabled, this occupation is selectable in public dropdowns across the platform.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

