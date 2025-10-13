import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      showCloseButton={false}
      className="max-w-lg mx-auto mt-20 rounded-lg"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
          <Button
            onClick={onConfirm}
            variant="default"
            className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:ml-3 sm:w-auto !bg-yellow-500 hover:!bg-yellow-600 !text-white"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
