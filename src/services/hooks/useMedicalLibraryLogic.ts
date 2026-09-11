import { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import { useMedicalLibraryTopics, useDeleteMedicalLibraryTopic } from "./useMedicalLibrary";
import { MedicalLibraryFilters, MedicalLibraryTopic } from "../api/medicalLibrary";
import { useConfirmation } from "@/hooks/useConfirmation";
import { showToast } from "@/services/utils/toast";

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

  // Modal state - removed as we use dedicated pages now

  const { data, isLoading, error, refetch } = useMedicalLibraryTopics(filters);
  const { mutate: deleteTopic, isPending: isDeleting } = useDeleteMedicalLibraryTopic();
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

  const tableColumns = useMemo(
    () => [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
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
    tableColumns,
    sortOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    handleDelete,
    confirmation,
  };
};
