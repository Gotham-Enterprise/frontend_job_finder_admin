"use client";

import React from 'react';
import { Modal } from '../modal';
import Button from '../button/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isFullscreen={false} 
      showCloseButton={false}
      className="!w-auto !h-auto max-w-md mx-auto my-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
        
          <Button
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
            <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
