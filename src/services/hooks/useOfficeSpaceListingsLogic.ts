import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useOfficeSpaceListings,
  useUpdateListingStatus,
} from "@/services/hooks/useOfficeSpaceAdmin";
import { usePreservedNavigation } from "@/hooks/usePreservedNavigation";
import {
  OfficeSpaceAdminFilters,
  ListingStatus,
} from "@/services/types/officeSpace";

export const useOfficeSpaceListingsLogic = () => {
  const router = useRouter();
  const { saveNavigationState } = usePreservedNavigation({
    statePath: "officeSpaceAdmin-search-state",
    scrollPath: "officeSpaceAdmin-scroll-position",
    listPagePath: "/admin/office-spaces",
  });

  const [filters, setFilters] = useState<OfficeSpaceAdminFilters>({
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading, isPending, error, refetch } =
    useOfficeSpaceListings(filters);
  const updateStatusMutation = useUpdateListingStatus();

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All Statuses" },
      { value: "ACTIVE", label: "Active" },
      { value: "DRAFT", label: "Draft" },
      { value: "PENDING_REVIEW", label: "Pending Review" },
      { value: "INACTIVE", label: "Inactive" },
      { value: "RENTED", label: "Rented" },
      { value: "ARCHIVED", label: "Archived" },
    ],
    []
  );

  const tableColumns = useMemo(
    () => [
      { key: "title", label: "Listing" },
      { key: "location", label: "Location" },
      { key: "size", label: "Size" },
      { key: "rent", label: "Rent" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ],
    []
  );

  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
    ],
    []
  );

  const filterChange = useCallback(
    (key: keyof OfficeSpaceAdminFilters, value: any) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value, page: 1 };
        saveNavigationState(newFilters);
        return newFilters;
      });
    },
    [saveNavigationState]
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => {
      const newFilters = { ...prev, search: searchInput, page: 1 };
      saveNavigationState(newFilters);
      return newFilters;
    });
  }, [searchInput, saveNavigationState]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const initPageChange = useCallback(
    (page: number) => {
      setFilters((prev) => {
        const newFilters = { ...prev, page };
        saveNavigationState(newFilters);
        return newFilters;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [saveNavigationState]
  );

  const getStatusBadge = useCallback((status: ListingStatus) => {
    const map: Record<
      string,
      { variant: string; label: string }
    > = {
      ACTIVE: { variant: "success", label: "Active" },
      DRAFT: { variant: "light", label: "Draft" },
      PENDING_REVIEW: { variant: "warning", label: "Pending Review" },
      INACTIVE: { variant: "error", label: "Inactive" },
      ARCHIVED: { variant: "light", label: "Archived" },
      RENTED: { variant: "info", label: "Rented" },
    };
    return map[status] || { variant: "light", label: status };
  }, []);

  const viewDetails = useCallback(
    (id: string) => {
      saveNavigationState(filters);
      router.push(`/admin/office-spaces/${id}`);
    },
    [router, filters, saveNavigationState]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: ListingStatus) => {
      await updateStatusMutation.mutateAsync({ id, status });
    },
    [updateStatusMutation]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10 });
    setSearchInput("");
  }, []);

  const clearIndividualFilter = useCallback(
    (key: keyof OfficeSpaceAdminFilters) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: undefined, page: 1 };
        if (key === "search") setSearchInput("");
        saveNavigationState(newFilters);
        return newFilters;
      });
    },
    [saveNavigationState]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.status);
  }, [filters.search, filters.status]);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    tableColumns,
    statusOptions,
    itemsPerPageOptions,
    filterChange,
    handleSearch,
    handleSearchKeyDown,
    initPageChange,
    getStatusBadge,
    viewDetails,
    handleStatusChange,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
