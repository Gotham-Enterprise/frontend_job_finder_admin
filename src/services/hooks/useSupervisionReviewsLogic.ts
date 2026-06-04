import { useState, useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSupervisionReviews,
  useDeleteSupervisionReview,
} from "@/services/hooks/useSupervisionReviews";
import { SupervisionReviewFilters } from "@/services/types/supervisionReview";

export const useSupervisionReviewsLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): SupervisionReviewFilters => {
    const keyword = searchParams.get("keyword") || "";
    const urlPage = searchParams.get("page");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");

    return {
      page: Math.max(1, parseInt(urlPage || "1", 10)),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      keyword,
      minRating: minRating ? parseInt(minRating, 10) : undefined,
      maxRating: maxRating ? parseInt(maxRating, 10) : undefined,
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<SupervisionReviewFilters>(
    () => initialFilters,
  );
  const [searchInput, setSearchInput] = useState(
    () => initialFilters.keyword || "",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Delete confirm state
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState<
    string | null
  >(null);
  const [deleteConfirmComment, setDeleteConfirmComment] = useState<string>("");

  const { mutateAsync: deleteMutation, isPending: isDeleting } =
    useDeleteSupervisionReview();

  // Sync keyword input with debounce via useEffect in the component (standard pattern)
  const applyKeywordSearch = useCallback((value: string) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        keyword: value || undefined,
        page: 1,
      }));
    });
  }, []);

  const filterChange = useCallback(
    (key: keyof SupervisionReviewFilters, value: unknown) => {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          [key]: value === "" || value === 0 ? undefined : value,
          page: 1,
        }));
      });
    },
    [],
  );

  const initPageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    startTransition(() => {
      setFilters({ page: 1, limit: filters.limit || 10 });
    });
  }, [filters.limit]);

  const clearIndividualFilter = useCallback(
    (key: keyof SupervisionReviewFilters) => {
      if (key === "keyword") setSearchInput("");
      startTransition(() => {
        setFilters((prev) => ({ ...prev, [key]: undefined, page: 1 }));
      });
    },
    [],
  );

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filters.keyword ||
        filters.minRating ||
        filters.maxRating ||
        filters.supervisorId ||
        filters.superviseeId
      ),
    [filters],
  );

  // Delete handlers
  const openDeleteConfirm = useCallback(
    (reviewId: string, comment: string | null) => {
      setDeleteConfirmReviewId(reviewId);
      setDeleteConfirmComment(comment ? comment.slice(0, 80) : "No comment");
    },
    [],
  );

  const cancelDelete = useCallback(() => {
    setDeleteConfirmReviewId(null);
    setDeleteConfirmComment("");
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmReviewId) return;
    await deleteMutation(deleteConfirmReviewId);
    setDeleteConfirmReviewId(null);
    setDeleteConfirmComment("");
  }, [deleteConfirmReviewId, deleteMutation]);

  const viewReview = useCallback(
    (reviewId: string) => {
      router.push(`/admin/supervision-reviews/details/${reviewId}`);
    },
    [router],
  );

  const { data, isLoading, error, refetch } = useSupervisionReviews(filters);

  const tableColumns = useMemo(
    () => [
      { key: "supervisee", label: "Supervisee" },
      { key: "supervisor", label: "Supervisor" },
      { key: "rating", label: "Rating" },
      { key: "comment", label: "Comment" },
      { key: "hire", label: "Hire Status" },
      { key: "createdAt", label: "Submitted" },
      { key: "actions", label: "", className: "text-right" },
    ],
    [],
  );

  const ratingOptions = useMemo(
    () => [
      { value: "1", label: "1 star" },
      { value: "2", label: "2 stars" },
      { value: "3", label: "3 stars" },
      { value: "4", label: "4 stars" },
      { value: "5", label: "5 stars" },
    ],
    [],
  );

  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
      { value: "100", label: "100 per page" },
    ],
    [],
  );

  return {
    filters,
    searchInput,
    setSearchInput,
    applyKeywordSearch,
    isFilterOpen,
    setIsFilterOpen,
    isPending,

    data,
    isLoading,
    error,
    refetch,

    tableColumns,
    ratingOptions,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    viewReview,

    deleteConfirmReviewId,
    deleteConfirmComment,
    isDeleting,
    openDeleteConfirm,
    cancelDelete,
    confirmDelete,
  };
};
