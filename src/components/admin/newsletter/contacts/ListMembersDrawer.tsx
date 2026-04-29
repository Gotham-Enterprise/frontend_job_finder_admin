"use client";
import React, { useState, useEffect } from "react";
import Drawer from "@/components/ui/drawer/Drawer";
import { useListMembers, useRemoveMembersFromList } from "@/services/hooks/useContacts";
import { ContactList, Contact } from "@/services/api/contacts";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import AddContactsToListModal from "./AddContactsToListModal";

interface Props {
  list: ContactList | null;
  onClose: () => void;
}

const LIMIT = 15;

export default function ListMembersDrawer({ list, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset state whenever a different list is opened
  useEffect(() => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setAddOpen(false);
    setRemoveTarget(null);
  }, [list?.id]);

  const { data, isLoading } = useListMembers(
    list?.id ?? null,
    page,
    LIMIT,
    debouncedSearch || undefined
  );

  const removeMutation = useRemoveMembersFromList();

  const members: Contact[] = data?.data ?? [];
  const meta = data?.metaData;

  const handleConfirmRemove = async () => {
    if (!removeTarget || !list) return;
    await removeMutation.mutateAsync({ listId: list.id, userIds: [removeTarget.id] });
    setRemoveTarget(null);
    // If we removed the last item on a non-first page, go back
    if (members.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
  };

  const existingMemberIds = members.map((m) => m.id);

  const isSystem = list?.isSystem ?? false;

  return (
    <>
      <Drawer
        isOpen={!!list}
        onClose={onClose}
        title={list ? list.name : ""}
        width="lg"
      >
        <div className="flex flex-col h-full">
          {/* Subtitle + actions bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {meta
                  ? `${meta.totalCount.toLocaleString()} contact${meta.totalCount !== 1 ? "s" : ""}`
                  : ""}
              </span>
              {isSystem && (
                <Badge size="sm" color="warning">
                  System — read only
                </Badge>
              )}
            </div>
            {!isSystem && (
              <button
                onClick={() => setAddOpen(true)}
                className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Contacts
              </button>
            )}
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
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

          {/* Members list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading members…</span>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <svg className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {debouncedSearch ? "No contacts match your search" : "No contacts in this list"}
                </p>
                {!isSystem && !debouncedSearch && (
                  <button
                    onClick={() => setAddOpen(true)}
                    className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
                  >
                    Add contacts
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {members.map((contact) => (
                  <li
                    key={contact.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase">
                        {(contact.firstName?.[0] ?? contact.email[0]).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {contact.email}
                      </p>
                    </div>

                    <Badge
                      size="sm"
                      color={contact.role === "employer" ? "info" : "success"}
                    >
                      {contact.role === "employer" ? "Employer" : "Job Seeker"}
                    </Badge>

                    {!isSystem && (
                      <button
                        onClick={() => setRemoveTarget(contact)}
                        disabled={removeMutation.isPending}
                        className="flex-shrink-0 text-xs text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50 ml-1"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-end px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </Drawer>

      {/* Remove confirmation */}
      <ConfirmationDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Contact"
        message={`Remove "${removeTarget?.email}" from this list? They will no longer receive emails sent to this list.`}
        confirmText="Remove"
        isLoading={removeMutation.isPending}
      />

      {/* Add contacts modal */}
      {list && !isSystem && (
        <AddContactsToListModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          listId={list.id}
          existingMemberIds={existingMemberIds}
        />
      )}
    </>
  );
}
