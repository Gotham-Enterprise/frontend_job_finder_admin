"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useContacts } from "@/services/hooks/useContacts";
import { useAddMembersToList } from "@/services/hooks/useContacts";
import { Contact } from "@/services/api/contacts";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  existingMemberIds: string[];
}

const LIMIT = 10;

export default function AddContactsToListModal({
  isOpen,
  onClose,
  listId,
  existingMemberIds,
}: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const { data, isLoading } = useContacts(
    page,
    LIMIT,
    debouncedSearch || undefined,
    undefined
  );

  const addMutation = useAddMembersToList();

  const contacts: Contact[] = data?.data ?? [];
  const meta = data?.metaData;

  const existingSet = new Set(existingMemberIds);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;
    await addMutation.mutateAsync({ listId, userIds: Array.from(selectedIds) });
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Add Contacts to List
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading…</span>
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
              No contacts found
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {contacts.map((contact) => {
                const alreadyMember = existingSet.has(contact.id);
                const isSelected = selectedIds.has(contact.id);
                return (
                  <li key={contact.id}>
                    <label
                      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                        alreadyMember
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={alreadyMember}
                        onChange={() => !alreadyMember && toggleSelect(contact.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge size="sm" color={contact.role === "employer" ? "info" : "success"}>
                          {contact.role === "employer" ? "Employer" : "Job Seeker"}
                        </Badge>
                        {alreadyMember && (
                          <Badge size="sm" color="light">
                            Added
                          </Badge>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage}
                className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.size > 0
              ? `${selectedIds.size} contact${selectedIds.size !== 1 ? "s" : ""} selected`
              : "Select contacts to add"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || addMutation.isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {addMutation.isPending && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              )}
              Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ""}Contact{selectedIds.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
