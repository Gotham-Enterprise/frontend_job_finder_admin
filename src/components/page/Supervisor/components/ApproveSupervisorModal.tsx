import React from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface ApproveSupervisorModalProps {
  isOpen: boolean;
  fullName: string;
  note: string;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ApproveSupervisorModal: React.FC<ApproveSupervisorModalProps> = ({
  isOpen,
  fullName,
  note,
  onNoteChange,
  onConfirm,
  onCancel,
  isLoading,
}) => {
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
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/20">
              <Check className="h-6 w-6 text-success-600 dark:text-success-400" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-1">
                Approve Supervisor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Approve <span className="font-medium">{fullName}</span>? They will become visible to supervisees on the
                platform.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="approve-supervisor-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <textarea
              id="approve-supervisor-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Add an internal note about this approval…"
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y min-h-[80px] disabled:opacity-60"
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
            className="px-4 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
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
                Processing…
              </div>
            ) : (
              "Approve"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveSupervisorModal;
