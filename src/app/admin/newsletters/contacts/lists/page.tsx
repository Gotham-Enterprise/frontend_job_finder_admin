"use client";
import React, { useState } from "react";
import { useContactLists, useDeleteContactList } from "@/services/hooks/useContacts";
import { ContactList } from "@/services/api/contacts";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import CreateListModal from "@/components/admin/newsletter/contacts/CreateListModal";

const TABLE_COLUMNS = [
  { key: "name", label: "List Name" },
  { key: "count", label: "Contact Count" },
  { key: "actions", label: "Actions" },
];

export default function ContactListsPage() {
  const { data, isLoading } = useContactLists();
  const deleteMutation = useDeleteContactList();
  const lists: ContactList[] = data?.data ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ContactList | null>(null);

  const handleDelete = async (list: ContactList) => {
    if (
      !confirm(
        `Delete list "${list.name}"? This will remove all contacts from this list. This cannot be undone.`
      )
    )
      return;
    await deleteMutation.mutateAsync(list.id);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {lists.length} list{lists.length !== 1 ? "s" : ""}
        </p>
        <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
          + Create List
        </Button>
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
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Auto-managed
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRenameTarget(list)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                          >
                            Rename
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <button
                            onClick={() => handleDelete(list)}
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
    </div>
  );
}
