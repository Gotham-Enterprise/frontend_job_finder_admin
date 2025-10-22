import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  inputType?: "text" | "textarea";
  required?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  placeholder = "Enter your response...",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  inputType = "textarea",
  required = true,
}: InputModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (required && inputValue.trim() === "") {
      setError("This field is required");
      return;
    }
    onConfirm(inputValue.trim());
    setInputValue("");
    setError("");
  };

  const handleCancel = () => {
    setInputValue("");
    setError("");
    onCancel();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputType === "text" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

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
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{message}</p>
                {inputType === "textarea" ? (
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    rows={4}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-primary focus:border-transparent
                             disabled:opacity-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-primary focus:border-transparent
                             disabled:opacity-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                )}
                {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
          <Button
            onClick={handleConfirm}
            variant="default"
            className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:ml-3 sm:w-auto !bg-yellow-500 hover:!bg-yellow-600"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
          <Button
            onClick={handleCancel}
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
