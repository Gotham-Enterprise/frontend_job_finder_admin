import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { deletedJobSeekersApi, DeletedJobSeekersFilters, DeletedJobSeekerAccount } from "../api/deletedJobSeekers";
import { showToast } from "../utils/toast";

export const useDeletedJobSeekersLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initialize filters from URL params
  const initializeFilters = useCallback((): DeletedJobSeekersFilters => {
    const urlFilters: DeletedJobSeekersFilters = {
      page: Math.max(1, parseInt(searchParams.get("page") || "1")),
      limit: parseInt(searchParams.get("limit") || "10"),
      search: searchParams.get("search") || "",
      deletedBy: searchParams.get("deletedBy") || undefined,
      isRestored: searchParams.get("isRestored") ? searchParams.get("isRestored") === "true" : undefined,
      deletedAfter: searchParams.get("deletedAfter") || undefined,
      deletedBefore: searchParams.get("deletedBefore") || undefined,
    };

    // Set search input
    setSearchInput(urlFilters.search || "");

    return urlFilters;
  }, [searchParams]);

  const [filters, setFilters] = useState<DeletedJobSeekersFilters>(initializeFilters);

  // Fetch deleted job seekers data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["deletedJobSeekers", filters],
    queryFn: () => deletedJobSeekersApi.getDeletedJobSeekerAccounts(filters),
    enabled: isInitialized,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      { key: "originalName", label: "Original Name", className: "min-w-[200px]" },
      { key: "originalEmail", label: "Original Email", className: "min-w-[200px]" },
      { key: "maskedEmail", label: "Current Email", className: "min-w-[200px]" },
      { key: "deletedBy", label: "Deleted By", className: "min-w-[150px]" },
      { key: "deletedAt", label: "Deleted At", className: "min-w-[150px]" },
      { key: "isRestored", label: "Status", className: "min-w-[100px]" },
      { key: "totalApplicationsCount", label: "Applications", className: "min-w-[100px]" },
      { key: "actions", label: "Actions", className: "min-w-[150px]" },
    ],
    []
  );

  // Items per page options
  const itemsPerPageOptions = useMemo(
    () => [
      { value: "5", label: "5 per page" },
      { value: "10", label: "10 per page" },
      { value: "25", label: "25 per page" },
      { value: "50", label: "50 per page" },
    ],
    []
  );

  // Status options for filtering
  const statusOptions = useMemo(
    () => [
      { value: "false", label: "Deleted (Not Restored)" },
      { value: "true", label: "Restored" },
    ],
    []
  );

  // Initialize component
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Update URL when filters change
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 10) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.deletedBy) params.set("deletedBy", filters.deletedBy);
    if (filters.isRestored !== undefined) params.set("isRestored", filters.isRestored.toString());
    if (filters.deletedAfter) params.set("deletedAfter", filters.deletedAfter);
    if (filters.deletedBefore) params.set("deletedBefore", filters.deletedBefore);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    const currentUrl = window.location.search;

    if (newUrl !== currentUrl) {
      router.replace(`/admin/job-seekers/deleted-accounts${newUrl}`, { scroll: false });
    }
  }, [filters, router, isInitialized]);

  // Handle filter changes
  const filterChange = useCallback((key: keyof DeletedJobSeekersFilters, value: any) => {
    setIsPending(true);

    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Reset to page 1 when changing filters (except page change)
      if (key !== "page") {
        newFilters.page = 1;
      }

      return newFilters;
    });

    setTimeout(() => setIsPending(false), 300);
  }, []);

  // Handle page changes
  const initPageChange = useCallback(
    (page: number) => {
      filterChange("page", page);
    },
    [filterChange]
  );

  // Handle search input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== searchInput) {
        filterChange("search", searchInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search, filterChange]);

  // View deleted account details
  const viewDeletedAccountDetails = useCallback(
    (deletedAccountId: string) => {
      // You can implement navigation to a details page or open a modal
      router.push(`/admin/job-seekers/deleted-accounts/${deletedAccountId}`);
    },
    [router]
  );

  // Restore account
  const restoreAccount = useCallback(
    async (deletedAccountId: string, adminPassword: string) => {
      setIsRestoring(true);
      try {
        const response = await deletedJobSeekersApi.restoreJobSeekerAccount(deletedAccountId, adminPassword);

        if (response.success) {
          showToast.success("Account Restored", response.message);
          // Refetch data to show updated status
          refetch();
          return response;
        } else {
          showToast.error("Restoration Failed", response.message);
          throw new Error(response.message);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to restore account";
        showToast.error("Restoration Failed", errorMessage);
        throw error;
      } finally {
        setIsRestoring(false);
      }
    },
    [refetch]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      deletedBy: undefined,
      isRestored: undefined,
      deletedAfter: undefined,
      deletedBefore: undefined,
    });
  }, []);

  // Clear individual filter
  const clearIndividualFilter = useCallback((filterType: string) => {
    const filterKey = filterType as keyof DeletedJobSeekersFilters;

    if (filterKey === "search") {
      setSearchInput("");
    }

    setFilters((prev) => ({
      ...prev,
      [filterKey]: filterKey === "page" ? 1 : filterKey === "limit" ? 10 : undefined,
    }));
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.deletedBy ||
      filters.isRestored !== undefined ||
      filters.deletedAfter ||
      filters.deletedBefore
    );
  }, [filters]);

  return {
    // State
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    isRestoring,

    // Data
    data,
    isLoading,
    error,
    refetch,

    // Configuration
    tableColumns,
    statusOptions,
    itemsPerPageOptions,

    // Actions
    filterChange,
    initPageChange,
    viewDeletedAccountDetails,
    restoreAccount,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  };
};
