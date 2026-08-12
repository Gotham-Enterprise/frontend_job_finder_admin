import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Appointment, AppointmentFilters, AppointmentsResponse } from "../types/appointment";
import { useGetAppointments } from "./useAppointments";

export interface UseAppointmentsLogic {
  data: Appointment[];
  isLoading: boolean;
  pagination: AppointmentsResponse["data"]["pagination"];
  tableColumns: { key: string; label: string; className?: string; sortKey?: string }[];
  filters: AppointmentFilters;
  itemsPerPageOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  onFilterChange: (key: string, value: string | number) => void;
  onSortChange: (sortKey: string) => void;
  onViewDetails: (id: Appointment["id"]) => void;
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "RESCHEDULED", label: "Rescheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "NO_SHOW", label: "No Show" },
  { value: "CANCELLED_BY_USER", label: "Cancelled by User" },
  { value: "CANCELLED_BY_ADMIN", label: "Cancelled by Admin" },
];

export const useAppointmentsLogic = (): UseAppointmentsLogic => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): AppointmentFilters => {
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortBy = searchParams.get("sortBy") || "startAt";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? ("desc" as const) : ("asc" as const);

    return { search, limit, page, status, dateFrom, dateTo, sortBy, sortOrder };
  };

  const [filters, setFilters] = useState<AppointmentFilters>(getInitialFilters);

  // isLoading (not isFetching): with keepPreviousData, refetches keep the
  // previous rows visible instead of flashing the loading state
  const { data: appointments, isLoading } = useGetAppointments(filters);

  const pagination = appointments?.data.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  };

  const tableColumns = useMemo(
    () => [
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Name" },
      { key: "contact", label: "Contact" },
      { key: "schedule", label: "Schedule (ET)", sortKey: "startAt" },
      { key: "facilitator", label: "Facilitator", sortKey: "facilitator" },
      { key: "status", label: "Status", sortKey: "status" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );
  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
      { value: "100", label: "100 per page" },
    ],
    []
  );
  const data = useMemo(() => appointments?.data.items || [], [appointments]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", encodeURIComponent(filters.search));
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    const nextUrl = params.toString() ? `?${params.toString()}` : "";
    const url = window.location.search;

    // Data refetches automatically because the filters are part of the query
    // key; this effect only keeps the URL shareable.
    if (nextUrl !== url) {
      router.replace(`/admin/appointments${nextUrl}`, { scroll: false });
    }
  }, [filters, router]);

  const onFilterChange = useCallback((key: string, value: string | number) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // Jump back to the first page whenever a narrowing filter changes
      if (key !== "page") {
        next.page = 1;
      }

      return next;
    });
  }, []);

  const onSortChange = useCallback((sortKey: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortKey,
      // Clicking the active column toggles direction; a new column starts ascending
      sortOrder: prev.sortBy === sortKey && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }, []);

  const onViewDetails = useCallback(
    (id: Appointment["id"]) => {
      router.push(`/admin/appointments/details/${id}`);
    },
    [router]
  );

  return {
    data,
    isLoading,
    pagination,
    tableColumns,
    filters,
    itemsPerPageOptions,
    statusOptions: APPOINTMENT_STATUS_OPTIONS,
    onFilterChange,
    onSortChange,
    onViewDetails,
  };
};
