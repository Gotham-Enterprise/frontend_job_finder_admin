import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupervisees, useResendSuperviseeVerification } from "@/services/hooks/useSupervisees";
import { SuperviseeFilters } from "@/services/types/supervisee";

export const useSuperviseeLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): SuperviseeFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const keyword = searchParams.get("keyword") || "";
      const urlPage = searchParams.get("page");

      const urlFilters: SuperviseeFilters = {
        page: Math.max(1, parseInt(urlPage || "1", 10)),
        limit: parseInt(searchParams.get("limit") || "10", 10),
        keyword,
      };

      const isSimpleNavigation = (!urlPage || urlPage === "1") && !keyword;

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem("supervisee-search-state");
        localStorage.removeItem("supervisee-scroll-position");
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem("supervisee-preserve-state");

      if (navigationFlag === "true") {
        sessionStorage.removeItem("supervisee-preserve-state");

        const savedState = localStorage.getItem("supervisee-search-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            return {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 10,
              keyword: parsed.keyword || "",
            };
          } catch {
            // fall through
          }
        }
      } else {
        localStorage.removeItem("supervisee-search-state");
        localStorage.removeItem("supervisee-scroll-position");
      }
    }

    return { page: 1, limit: 10, keyword: "" };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<SuperviseeFilters>(() => initialFilters);
  const [searchInput, setSearchInput] = useState(() => initialFilters.keyword || "");
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    superviseeId: string;
    fullName: string;
  }>({ isOpen: false, superviseeId: "", fullName: "" });

  const [resendModal, setResendModal] = useState<{
    isOpen: boolean;
    superviseeId: string;
    fullName: string;
  }>({ isOpen: false, superviseeId: "", fullName: "" });

  const { mutate: resendMutate, isPending: isResending } = useResendSuperviseeVerification();

  useEffect(() => {
    setIsInitialized(true);
    if (initialFilters.keyword || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 10) params.set("limit", filters.limit.toString());
    if (filters.keyword) params.set("keyword", encodeURIComponent(filters.keyword));

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/supervisees${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("supervisee-scroll-position");
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => window.scrollTo({ top: position, behavior: "smooth" }), 100);
      }
    }
  }, [searchParams]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("supervisee-scroll-position", window.scrollY.toString());
    }
  }, []);

  const saveSearchState = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "supervisee-search-state",
        JSON.stringify({
          page: filters.page,
          limit: filters.limit,
          keyword: filters.keyword,
        }),
      );
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useSupervisees(filters);

  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "state", label: "State" },
      { key: "format", label: "Preferred Format" },
      { key: "howSoon", label: "How Soon" },
      { key: "emailVerified", label: "Email" },
      { key: "createdAt", label: "Registered" },
      { key: "actions", label: "", className: "text-right" },
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

  const filterChange = useCallback((key: keyof SuperviseeFilters, value: any) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "" ? undefined : value,
        page: 1,
      }));
    });
  }, []);

  const initPageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const viewSupervisee = useCallback(
    (superviseeId: string) => {
      saveScrollPosition();
      saveSearchState();

      if (typeof window !== "undefined") {
        sessionStorage.setItem("supervisee-preserve-state", "true");
        sessionStorage.setItem("supervisee-selected-item", superviseeId);
      }

      router.push(`/admin/supervisees/details/${superviseeId}`);
    },
    [router, saveScrollPosition, saveSearchState],
  );

  const openEditModal = useCallback((superviseeId: string, fullName: string) => {
    setEditModal({ isOpen: true, superviseeId, fullName });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, superviseeId: "", fullName: "" });
  }, []);

  const openResendModal = useCallback((superviseeId: string, fullName: string) => {
    setResendModal({ isOpen: true, superviseeId, fullName });
  }, []);

  const closeResendModal = useCallback(() => {
    setResendModal({ isOpen: false, superviseeId: "", fullName: "" });
  }, []);

  const confirmResend = useCallback(() => {
    if (!resendModal.superviseeId) return;
    resendMutate(resendModal.superviseeId, { onSettled: closeResendModal });
  }, [resendModal.superviseeId, resendMutate, closeResendModal]);

  const clearAllFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, keyword: "" });
    setSearchInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("supervisee-scroll-position");
      localStorage.removeItem("supervisee-search-state");
    }
  }, []);

  const hasActiveFilters = useMemo(() => !!searchInput, [searchInput]);

  useEffect(() => {
    if (!isInitialized) return;
    if (hasRestoredFromState && searchInput === initialFilters.keyword) return;

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        const shouldResetPage = searchInput !== filters.keyword;
        setFilters((prev) => ({
          ...prev,
          keyword: searchInput,
          page: shouldResetPage ? 1 : prev.page,
        }));

        if (hasRestoredFromState) setHasRestoredFromState(false);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.keyword, hasRestoredFromState, initialFilters.keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    filters,
    searchInput,
    setSearchInput,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    tableColumns,
    itemsPerPageOptions,
    filterChange,
    initPageChange,
    viewSupervisee,
    clearAllFilters,
    hasActiveFilters,
    editModal,
    openEditModal,
    closeEditModal,

    resendModal,
    isResending,
    openResendModal,
    closeResendModal,
    confirmResend,
  };
};
