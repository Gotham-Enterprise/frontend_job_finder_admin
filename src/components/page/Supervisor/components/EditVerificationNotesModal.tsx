import React from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface EditVerificationNotesModalProps {
  isOpen: boolean;
  fullName: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditVerificationNotesModal: React.FC<EditVerificationNotesModalProps> = ({
  isOpen,
  fullName,
  notes,
  onNotesChange,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const isDisabled = isLoading || !notes.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      isFullscreen={false}
      showCloseButton={false}
      className="max-w-md mx-auto mt-20 rounded-xl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
              <Pencil className="h-6 w-6 text-primary dark:text-primary" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-1">
                Edit verification notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Update the verification notes for <span className="font-medium">{fullName}</span>. This replaces the
                current notes on their profile.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="edit-verification-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Verification notes <span className="text-error-500">*</span>
            </label>
            <textarea
              id="edit-verification-notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={5}
              placeholder="Enter verification notes…"
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y min-h-[100px] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDisabled}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving…
              </div>
            ) : (
              "Save notes"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditVerificationNotesModal;
