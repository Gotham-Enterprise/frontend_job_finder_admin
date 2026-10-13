import React, { ReactNode, useState } from "react";
import Button from "@/components/ui/button/Button";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { BulkActionResponse } from "@/services/types/bulkAction";
import { showToast } from "@/services/utils/toast";

export interface BulkRowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Selected ids this action applies to; the rest of the selection is skipped. */
  ids: string[];
  /** Why selected rows outside `ids` are skipped, e.g. "already verified". */
  skipReason?: string;
  run: (ids: string[]) => Promise<BulkActionResponse>;
  confirmTitle: string;
  /** Question shown before running, given the affected rows, e.g. "Pause 3 supervisors?". */
  confirmMessage: (target: string) => string;
  /** Toast prefix on success, e.g. "Verification email resent to". */
  doneMessage: string;
  /** Refetch the list afterwards, for actions that change what the rows show. */
  refreshAfter?: boolean;
  primary?: boolean;
}

interface BulkActionsBarProps {
  selectedCount: number;
  /** Singular noun for a row, e.g. "job seeker". */
  itemNoun: string;
  actions: BulkRowAction[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

function reportResult(action: BulkRowAction, itemNoun: string, { data }: BulkActionResponse) {
  const { succeeded, failed } = data;
  const done = `${action.doneMessage} ${pluralize(succeeded.length, itemNoun)}`;

  if (!failed.length) {
    showToast.success(action.label, `${done}.`);
    return;
  }

  const firstFailure = `${failed[0].message}${failed.length > 1 ? ` (+${failed.length - 1} more)` : ""}`;
  if (succeeded.length) {
    showToast.warning(action.label, `${done}; ${failed.length} failed: ${firstFailure}`);
  } else {
    showToast.error(action.label, `All ${failed.length} failed: ${firstFailure}`);
  }
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  itemNoun,
  actions,
  onClearSelection,
  onRefresh,
}) => {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingAction = actions.find((action) => action.key === pendingKey) ?? null;

  const closeDialog = () => {
    if (!isSubmitting) setPendingKey(null);
  };

  const confirm = async () => {
    if (!pendingAction || !pendingAction.ids.length) return;

    setIsSubmitting(true);
    try {
      const response = await pendingAction.run(pendingAction.ids);
      reportResult(pendingAction, itemNoun, response);
      onClearSelection();
      if (pendingAction.refreshAfter) onRefresh();
    } catch (error) {
      showToast.error(
        pendingAction.label,
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setPendingKey(null);
    }
  };

  const confirmMessage = () => {
    if (!pendingAction) return "";
    const count = pendingAction.ids.length;
    const skipped = selectedCount - count;
    const message = pendingAction.confirmMessage(pluralize(count, itemNoun));
    if (!skipped) return message;
    const reason = pendingAction.skipReason ? ` (${pendingAction.skipReason})` : "";
    return `${message} The other ${pluralize(skipped, `selected ${itemNoun}`)}${reason} will be skipped.`;
  };

  if (!selectedCount && !pendingAction) return null;

  return (
    <>
      <div className="mx-6 mt-4 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {pluralize(selectedCount, itemNoun)} selected
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-sm text-gray-600 underline hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Clear selection
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.key}
              type="button"
              size="lg"
              variant={action.primary ? "default" : "outlinePrimary"}
              className="!px-4"
              startIcon={action.icon}
              onClick={() => setPendingKey(action.key)}
              disabled={isSubmitting || !action.ids.length}
            >
              {action.ids.length === selectedCount
                ? action.label
                : `${action.label} (${action.ids.length})`}
            </Button>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!pendingAction}
        onClose={closeDialog}
        onCancel={closeDialog}
        onConfirm={confirm}
        title={pendingAction?.confirmTitle ?? ""}
        message={confirmMessage()}
        confirmText={pendingAction?.label}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default BulkActionsBar;
