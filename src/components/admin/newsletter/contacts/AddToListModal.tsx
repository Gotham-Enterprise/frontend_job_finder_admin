"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useContactLists } from "@/services/hooks/useContacts";
import { useAddMembersToList } from "@/services/hooks/useContacts";
import { ContactList } from "@/services/api/contacts";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onSuccess?: () => void;
}

export default function AddToListModal({
  isOpen,
  onClose,
  selectedUserIds,
  onSuccess,
}: AddToListModalProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");
  const { data } = useContactLists();
  const addMutation = useAddMembersToList();

  const customLists: ContactList[] = (data?.data ?? []).filter((l) => !l.isSystem);

  const handleAdd = async () => {
    if (!selectedListId || selectedUserIds.length === 0) return;
    await addMutation.mutateAsync({ listId: selectedListId, userIds: selectedUserIds });
    setSelectedListId("");
    onSuccess?.();
    onClose();
  };

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) setSelectedListId("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Add to List
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Adding{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {selectedUserIds.length} contact{selectedUserIds.length !== 1 ? "s" : ""}
          </span>{" "}
          to a list
        </p>

        {customLists.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No custom lists yet. Create a list in the Lists tab first.
          </p>
        ) : (
          <div className="mb-4 space-y-2">
            {customLists.map((list) => (
              <label
                key={list.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  type="radio"
                  name="contactList"
                  value={list.id}
                  checked={selectedListId === list.id}
                  onChange={() => setSelectedListId(list.id)}
                  className="accent-brand-500"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {list.name}
                </span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {list.contactCount} contact{list.contactCount !== 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={addMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedListId || addMutation.isPending || customLists.length === 0}
          >
            {addMutation.isPending ? "Adding…" : "Add to List"}
          </Button>
        </div>
      </div>
    </div>
  );
}
