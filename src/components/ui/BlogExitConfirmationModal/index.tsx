"use client";
import React from "react";
import { Modal } from "../modal";
import Button from "../button/Button";

interface BlogExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsDraft: () => void;
  onExitWithoutSaving: () => void;
  blogTitle?: string;
  isLoading?: boolean;
}

const BlogExitConfirmationModal: React.FC<BlogExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onSaveAsDraft,
  onExitWithoutSaving,
  blogTitle = "Untitled Blog",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      showCloseButton={false}
      className="max-w-md mx-auto my-20 rounded-lg shadow-xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Save your progress?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have unsaved changes to "<span className="font-medium">{blogTitle}</span>". 
            Would you like to save it as a draft before leaving?
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            variant="default"
            onClick={onSaveAsDraft}
            disabled={isLoading}
            className="w-full justify-center"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </Button>
          
          <Button
            variant="outline"
            onClick={onExitWithoutSaving}
            disabled={isLoading}
            className="w-full justify-center"
          >
            Exit without saving
          </Button>
          
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Continue editing
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BlogExitConfirmationModal;