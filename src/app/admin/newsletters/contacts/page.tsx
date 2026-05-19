"use client";
import React, { useState } from "react";
import { useContacts } from "@/services/hooks/useContacts";
import { Contact } from "@/services/api/contacts";
import { ContactFilters } from "@/services/api/contacts";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import AddToListModal from "@/components/admin/newsletter/contacts/AddToListModal";
import { useOccupationsWithSpecialties } from "@/services/hooks/useJobCreation";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useStatesCities, useCitiesByState } from "@/lib/useStatesCities";

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({});
  const limit = 20;

  const { data: occupationsData } = useOccupationsWithSpecialties();
  const { data: statesCitiesData } = useStatesCities();
  const occupations = occupationsData?.data ?? [];
  const selectedOccupation = occupations.find((o) => o.id === filters.occupationId);
  const specialties = selectedOccupation?.specialty ?? [];
  const isEmployerOnly = filters.role === "employer";
  const selectedStateCode = React.useMemo(() => {
    if (!filters.state || !statesCitiesData) return null;

    const matchingStateEntry = Object.entries(statesCitiesData).find(([, stateData]) => {
      return stateData.name === filters.state;
    });

    return matchingStateEntry?.[0] ?? null;
  }, [filters.state, statesCitiesData]);
  const { data: citiesByState = [], isLoading: isLoadingCities } = useCitiesByState(selectedStateCode);
  const stateOptions = React.useMemo(() => {
    if (!statesCitiesData) return [];

    return Object.entries(statesCitiesData)
      .map(([stateCode, stateData]) => ({
        value: stateData.name,
        label: `${stateData.name} (${stateCode})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [statesCitiesData]);
  const cityOptions = React.useMemo(
    () => citiesByState.map((city) => ({ value: city, label: city })),
    [citiesByState]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value || undefined };
      if (!value) delete next[key];
      return next;
    });
    setPage(1);
    setSelected(new Set());
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    setSelected(new Set());
  };

  const updateRoleFilter = (value: ContactFilters["role"]) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        role: value || undefined,
      };

      if (!value) {
        delete next.role;
      }

      if (value === "employer") {
        delete next.occupationId;
        delete next.specialtyId;
      }

      return next;
    });
    setPage(1);
    setSelected(new Set());
  };

  const updateOccupationFilter = (value?: number) => {
    setFilters((prev) => {
      const next = { ...prev, occupationId: value, specialtyId: undefined };
      if (!value) delete next.occupationId;
      delete next.specialtyId;
      return next;
    });
    setPage(1);
    setSelected(new Set());
  };

  const updateStateFilter = (value?: string) => {
    setFilters((prev) => {
      const next = { ...prev, state: value || undefined, city: undefined };
      if (!value) delete next.state;
      delete next.city;
      return next;
    });
    setPage(1);
    setSelected(new Set());
  };

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

  const { data, isLoading } = useContacts(page, limit, debouncedSearch || undefined, activeFilterCount > 0 ? filters : undefined);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-brand-500 text-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
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
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                User Type
              </label>
              <select
                value={filters.role ?? ""}
                onChange={(e) => updateRoleFilter(e.target.value as ContactFilters["role"])}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Users</option>
                <option value="employer">Employers</option>
                <option value="job-seeker">Job Seekers</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Occupation
              </label>
              <select
                value={filters.occupationId ?? ""}
                onChange={(e) => updateOccupationFilter(e.target.value ? Number(e.target.value) : undefined)}
                disabled={isEmployerOnly}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Occupations</option>
                {occupations.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialtyId ?? ""}
                onChange={(e) => updateFilter("specialtyId", e.target.value ? Number(e.target.value) : undefined)}
                disabled={isEmployerOnly || !filters.occupationId || specialties.length === 0}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                City
              </label>
              <SearchableSelect
                value={filters.city ?? ""}
                onChange={(value) => updateFilter("city", value || undefined)}
                options={cityOptions}
                placeholder={filters.state ? (isLoadingCities ? "Loading cities..." : "Select city...") : "Select state first"}
                searchPlaceholder="Search cities..."
                className="w-full"
                disabled={!filters.state || isLoadingCities}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                State
              </label>
              <SearchableSelect
                value={filters.state ?? ""}
                onChange={(value) => updateStateFilter(value || undefined)}
                options={stateOptions}
                placeholder="Select state..."
                searchPlaceholder="Search states..."
                className="w-full"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

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
