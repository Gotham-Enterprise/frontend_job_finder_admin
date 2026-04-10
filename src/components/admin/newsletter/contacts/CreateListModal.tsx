"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useCreateContactList, useRenameContactList } from "@/services/hooks/useContacts";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the modal is in rename mode */
  listId?: string;
  initialName?: string;
}

export default function CreateListModal({
  isOpen,
  onClose,
  listId,
  initialName = "",
}: CreateListModalProps) {
  const [name, setName] = useState(initialName);
  const isRenaming = !!listId;

  const createMutation = useCreateContactList();
  const renameMutation = useRenameContactList();

  const isPending = createMutation.isPending || renameMutation.isPending;

  // Sync initialName when modal re-opens in rename mode
  React.useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isRenaming && listId) {
      await renameMutation.mutateAsync({ id: listId, name: trimmed });
    } else {
      await createMutation.mutateAsync(trimmed);
    }
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isRenaming ? "Rename List" : "Create List"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              List name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Newsletter subscribers"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setName(initialName);
                onClose();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Saving…" : isRenaming ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
