import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface HideProfileModalProps {
  isOpen: boolean;
  fullName: string;
  /** Current visibility state; when true the next action shows (unhides) the profile. */
  currentlyHidden: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const HideProfileModal: React.FC<HideProfileModalProps> = ({
  isOpen,
  fullName,
  currentlyHidden,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const willHide = !currentlyHidden;
  const Icon = willHide ? EyeOff : Eye;

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
              <Icon className="h-6 w-6 text-primary dark:text-primary" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-1">
                {willHide ? "Hide Profile" : "Show Profile"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {willHide ? (
                  <>
                    Hide <span className="font-medium">{fullName}</span>&apos;s profile? It will no
                    longer appear in public listings until you make it visible again.
                  </>
                ) : (
                  <>
                    Make <span className="font-medium">{fullName}</span>&apos;s profile visible
                    again? It will reappear in public listings.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="px-4 py-2 text-sm font-medium !text-gray-700 dark:!text-gray-300 !bg-white dark:!bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white !bg-primary rounded-lg hover:!bg-primary/90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                Saving…
              </div>
            ) : willHide ? (
              "Hide Profile"
            ) : (
              "Show Profile"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HideProfileModal;
