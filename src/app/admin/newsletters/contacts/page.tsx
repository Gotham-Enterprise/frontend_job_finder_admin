"use client";
import React, { useState } from "react";
import { useContacts } from "@/services/hooks/useContacts";
import { Contact } from "@/services/api/contacts";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import AddToListModal from "@/components/admin/newsletter/contacts/AddToListModal";

const roleSystemList: Record<string, string> = {
  employer: "Employers",
  "job-seeker": "Job Seekers",
};

export default function AllContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const limit = 20;

  // Simple debounce via timeout
  const searchRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      setSelected(new Set());
    }, 400);
  };

  const { data, isLoading } = useContacts(page, limit, debouncedSearch || undefined);
  const contacts: Contact[] = data?.data ?? [];
  const meta = data?.metaData;

  const allPageIds = contacts.map((c) => c.id);
  const allPageSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tableColumns = [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={allPageSelected}
          onChange={toggleAll}
          className="accent-brand-500 h-4 w-4 cursor-pointer"
        />
      ),
    },
    { key: "email", label: "Email" },
    { key: "lists", label: "Lists" },
  ];

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px] max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by email…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {selected.size > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            Add {selected.size} to List
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeading columns={tableColumns} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={3}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading contacts…
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={3}>
                    <p className="text-gray-500 dark:text-gray-400">
                      {debouncedSearch ? "No contacts match your search" : "No contacts found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    {/* Checkbox */}
                    <TableCell className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.has(contact.id)}
                        onChange={() => toggleOne(contact.id)}
                        className="accent-brand-500 h-4 w-4 cursor-pointer"
                      />
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {contact.email}
                    </TableCell>

                    {/* Lists */}
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {/* System list badge from role */}
                        <Badge
                          size="sm"
                          color={contact.role === "employer" ? "info" : "success"}
                        >
                          {roleSystemList[contact.role]}
                        </Badge>

                        {/* Custom list badges */}
                        {contact.customLists.map((list) => (
                          <Badge key={list.id} size="sm" color="primary">
                            {list.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {meta.totalCount} total contact{meta.totalCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!meta.hasPreviousPage}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddToListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedUserIds={Array.from(selected)}
        onSuccess={() => setSelected(new Set())}
      />
    </div>
  );
}
