import { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import {
  useMedicalLibraryTopics,
  useDeleteMedicalLibraryTopic,
  useBulkUpdateMedicalLibraryStatus,
} from "./useMedicalLibrary";
import {
  MedicalLibraryFilters,
  MedicalLibraryStatus,
  MedicalLibraryTopic,
  MEDICAL_LIBRARY_SOURCE_LABELS,
} from "../api/medicalLibrary";
import { useConfirmation } from "@/hooks/useConfirmation";
import { showToast } from "@/services/utils/toast";

export type BulkStatusScope = "selected" | "filter";

export const useMedicalLibraryLogic = () => {
  const [filters, setFilters] = useState<MedicalLibraryFilters>({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useMedicalLibraryTopics(filters);
  const { mutate: deleteTopic, isPending: isDeleting } = useDeleteMedicalLibraryTopic();
  const { mutate: bulkUpdateStatus, isPending: isBulkUpdating } = useBulkUpdateMedicalLibraryStatus();
  const confirmation = useConfirmation();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      });
    }, 500);
    return () => clearTimeout(id);
  }, [searchInput]);

  // A selection only makes sense for the rows on screen; any filter or page
  // change swaps those rows out, so the selection is dropped with them.
  useEffect(() => {
    setSelectedIds([]);
  }, [filters]);

  const tableColumns = useMemo(
    () => [
      { key: "select", label: "", className: "w-12 pr-0" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "source", label: "Source" },
      { key: "slug", label: "Slug" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created At" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "createdAt-desc", label: "Newest First" },
      { value: "createdAt-asc", label: "Oldest First" },
      { value: "title-asc", label: "Title A-Z" },
      { value: "title-desc", label: "Title Z-A" },
    ],
    []
  );

  const itemsPerPageOptions = useMemo(
    () => [
      { value: "5", label: "5 per page" },
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
    ],
    []
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      { value: "Mental Health Disorders", label: "Mental Health Disorders" },
      { value: "Medical Conditions", label: "Medical Conditions" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All statuses" },
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
    []
  );

  const sourceOptions = useMemo(
    () => [
      { value: "", label: "All sources" },
      ...Object.entries(MEDICAL_LIBRARY_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
    ],
    []
  );

  const filterChange = useCallback((key: keyof MedicalLibraryFilters, value: any) => {
    startTransition(() => {
      if (key === "sortBy") {
        const [sortBy, sortOrder] = value.split("-");
        setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
      } else {
        setFilters((prev) => ({ ...prev, [key]: value === "" ? undefined : value, page: 1 }));
      }
    });
  }, []);

  const initPageChange = useCallback((newPage: number) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, page: newPage }));
    });
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────

  const pageIds = useMemo(() => (data?.data || []).map((topic: MedicalLibraryTopic) => topic.id), [data]);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? pageIds : []);
    },
    [pageIds]
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // The constraints the list is currently fetched with, minus paging and
  // sorting — exactly what "everything matching this filter" means to the
  // admin looking at the table. Empty when no filter is set, in which case
  // the filter-scoped bulk action is not offered (the backend would refuse
  // it anyway rather than flip every topic in the table).
  const activeFilter = useMemo(() => {
    const picked = {
      source: filters.source || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      search: filters.search || undefined,
    };
    return Object.values(picked).some(Boolean) ? picked : null;
  }, [filters.source, filters.status, filters.category, filters.search]);

  const describeActiveFilter = useCallback(() => {
    if (!activeFilter) return "";
    const parts: string[] = [];
    if (activeFilter.source) parts.push(`source "${MEDICAL_LIBRARY_SOURCE_LABELS[activeFilter.source] || activeFilter.source}"`);
    if (activeFilter.status) parts.push(`status "${activeFilter.status}"`);
    if (activeFilter.category) parts.push(`category "${activeFilter.category}"`);
    if (activeFilter.search) parts.push(`title containing "${activeFilter.search}"`);
    return parts.join(", ");
  }, [activeFilter]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDelete = async (topicId: string, topicTitle: string) => {
    const confirmed = await confirmation.confirm({
      title: "Delete Topic",
      message: `Are you sure you want to delete "${topicTitle}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteTopic(topicId, {
        onSuccess: () => {
          showToast.success("Success", "Topic deleted successfully");
        },
        onError: (err: any) => {
          showToast.error("Error", err?.message || "Failed to delete topic");
        },
      });
    }
  };

  const handleBulkStatus = async (status: MedicalLibraryStatus, scope: BulkStatusScope) => {
    const verb = status === "published" ? "Publish" : "Set to draft";
    const totalCount = data?.metaData?.totalCount || 0;
    const count = scope === "selected" ? selectedIds.length : totalCount;

    if (scope === "selected" && selectedIds.length === 0) return;
    if (scope === "filter" && !activeFilter) return;

    const target =
      scope === "selected"
        ? `the ${count} selected topic${count === 1 ? "" : "s"}`
        : `all ${count} topic${count === 1 ? "" : "s"} matching ${describeActiveFilter()}`;

    const confirmed = await confirmation.confirm({
      title: `${verb}: ${count} topic${count === 1 ? "" : "s"}`,
      message:
        status === "published"
          ? `${verb} ${target}? They will be visible on the public Medical Library immediately, and any pending re-import review on them is cleared.`
          : `${verb} ${target}? They will be hidden from the public Medical Library until published again.`,
      confirmText: verb,
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    bulkUpdateStatus(
      scope === "selected" ? { status, ids: selectedIds } : { status, filter: activeFilter! },
      {
        onSuccess: (res) => {
          const n = res?.data?.count ?? count;
          showToast.success("Done", `${n} topic${n === 1 ? "" : "s"} ${status === "published" ? "published" : "set to draft"}`);
          setSelectedIds([]);
        },
        onError: (err: any) => {
          showToast.error("Error", err?.message || "Bulk update failed");
        },
      }
    );
  };

  return {
    filters,
    searchInput,
    setSearchInput,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    isCreating: false,
    isUpdating: false,
    isDeleting,
    isBulkUpdating,
    tableColumns,
    sortOptions,
    itemsPerPageOptions,
    categoryOptions,
    statusOptions,
    sourceOptions,
    filterChange,
    initPageChange,
    handleDelete,
    confirmation,
    // selection + bulk
    selectedIds,
    allOnPageSelected,
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
    activeFilter,
    describeActiveFilter,
    handleBulkStatus,
  };
};
