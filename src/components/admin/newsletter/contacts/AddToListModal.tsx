"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import { useInfiniteContactLists } from "@/services/hooks/useContacts";
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteContactLists(debouncedSearch || undefined);

  const addMutation = useAddMembersToList();

  const customLists: ContactList[] = (data?.pages.flatMap((p) => p.data) ?? []).filter(
    (l) => !l.isSystem
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setSelectedListId("");
    }, 300);
  };

  const handleAdd = async () => {
    if (!selectedListId || selectedUserIds.length === 0) return;
    await addMutation.mutateAsync({ listId: selectedListId, userIds: selectedUserIds });
    setSelectedListId("");
    onSuccess?.();
    onClose();
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedListId("");
      setSearch("");
      setDebouncedSearch("");
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  }, [isOpen]);

  // Infinite scroll via IntersectionObserver on sentinel
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

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

        {/* Search input */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search lists by name…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-16 mb-4">
            <svg
              className="animate-spin h-5 w-5 text-brand-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : customLists.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {debouncedSearch
              ? "No lists match your search."
              : "No custom lists yet. Create a list in the Lists tab first."}
          </p>
        ) : (
          <div className="mb-4 max-h-56 overflow-y-auto space-y-2 pr-1">
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
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 min-w-0 truncate">
                  {list.name}
                </span>
                <span className="ml-auto shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {list.contactCount} contact{list.contactCount !== 1 ? "s" : ""}
                </span>
              </label>
            ))}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <svg
                  className="animate-spin h-4 w-4 text-brand-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
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
