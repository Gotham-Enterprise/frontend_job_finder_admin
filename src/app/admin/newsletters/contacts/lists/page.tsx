"use client";
import React, { useState, useEffect } from "react";
import { useContactLists, useDeleteContactList } from "@/services/hooks/useContacts";
import { ContactList } from "@/services/api/contacts";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import Pagination from "@/components/tables/Pagination";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import CreateListModal from "@/components/admin/newsletter/contacts/CreateListModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import ListMembersDrawer from "@/components/admin/newsletter/contacts/ListMembersDrawer";

const LIMIT = 10;

const TABLE_COLUMNS = [
  { key: "name", label: "List Name" },
  { key: "count", label: "Contact Count" },
  { key: "actions", label: "Actions" },
];

export default function ContactListsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useContactLists(page, LIMIT, debouncedSearch || undefined);
  const deleteMutation = useDeleteContactList();
  const lists: ContactList[] = data?.data ?? [];
  const meta = data?.metaData;

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ContactList | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactList | null>(null);
  const [viewTarget, setViewTarget] = useState<ContactList | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    // If this was the last item on a non-first page, go back one page
    if (lists.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta ? `${meta.totalCount} list${meta.totalCount !== 1 ? "s" : ""}` : ""}
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lists…"
              className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-48"
            />
          </div>
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
            + Create List
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeading columns={TABLE_COLUMNS} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={3}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading lists…
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : lists.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={3}>
                    <p className="text-gray-500 dark:text-gray-400">No lists found</p>
                  </TableCell>
                </TableRow>
              ) : (
                lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {list.name}
                        </span>
                        {list.isSystem && (
                          <Badge size="sm" color="warning">
                            System
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {list.contactCount.toLocaleString()}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      {list.isSystem ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewTarget(list)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                          >
                            View
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Auto-managed
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewTarget(list)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                          >
                            View
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <button
                            onClick={() => setRenameTarget(list)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                          >
                            Rename
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <button
                            onClick={() => setDeleteTarget(list)}
                            disabled={deleteMutation.isPending}
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateListModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Rename modal */}
      <CreateListModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        listId={renameTarget?.id}
        initialName={renameTarget?.name ?? ""}
      />

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete List"
        message={`Delete list "${deleteTarget?.name}"? This will remove all contacts from this list. This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      {/* Members drawer */}
      <ListMembersDrawer
        list={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
