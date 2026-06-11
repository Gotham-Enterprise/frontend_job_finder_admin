import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupervisors, useApproveSupervisor, useRejectSupervisor } from "@/services/hooks/useSupervisors";
import { SupervisorFilters, VerificationStatus } from "@/services/types/supervisor";

export const useSupervisorLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): SupervisorFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const keyword = searchParams.get("keyword") || "";
      const statusParam = searchParams.get("verificationStatus");
      const validStatus =
        statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam)
          ? (statusParam as VerificationStatus)
          : undefined;
      const urlPage = searchParams.get("page");

      const urlFilters: SupervisorFilters = {
        page: Math.max(1, parseInt(urlPage || "1", 10)),
        limit: parseInt(searchParams.get("limit") || "10", 10),
        keyword,
        verificationStatus: validStatus || undefined,
      };

      const isSimpleNavigation =
        (!urlPage || urlPage === "1") && !keyword && !statusParam;

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem("supervisor-search-state");
        localStorage.removeItem("supervisor-scroll-position");
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem("supervisor-preserve-state");

      if (navigationFlag === "true") {
        sessionStorage.removeItem("supervisor-preserve-state");

        const savedState = localStorage.getItem("supervisor-search-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            return {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 10,
              keyword: parsed.keyword || "",
              verificationStatus: parsed.verificationStatus || undefined,
            };
          } catch {
            // fall through to defaults
          }
        }
      } else {
        localStorage.removeItem("supervisor-search-state");
        localStorage.removeItem("supervisor-scroll-position");
      }
    }

    return { page: 1, limit: 10, keyword: "", verificationStatus: undefined };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<SupervisorFilters>(() => initialFilters);
  const [searchInput, setSearchInput] = useState(() => initialFilters.keyword || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  // Edit profile modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    supervisorId: string;
    fullName: string;
  }>({ isOpen: false, supervisorId: "", fullName: "" });

  // Approve/reject action state
  const [approveModal, setApproveModal] = useState<{ isOpen: boolean; supervisorId: string; fullName: string }>({
    isOpen: false,
    supervisorId: "",
    fullName: "",
  });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; supervisorId: string; fullName: string }>({
    isOpen: false,
    supervisorId: "",
    fullName: "",
  });
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const { mutate: approveMutate, isPending: isApproving } = useApproveSupervisor();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectSupervisor();

  useEffect(() => {
    setIsInitialized(true);
    if (initialFilters.keyword || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 10) params.set("limit", filters.limit.toString());
    if (filters.keyword) params.set("keyword", encodeURIComponent(filters.keyword));
    if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/supervisors${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  // Restore scroll on back navigation
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("supervisor-scroll-position");
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => window.scrollTo({ top: position, behavior: "smooth" }), 100);
      }
    }
  }, [searchParams]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("supervisor-scroll-position", window.scrollY.toString());
    }
  }, []);

  const saveSearchState = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "supervisor-search-state",
        JSON.stringify({
          page: filters.page,
          limit: filters.limit,
          keyword: filters.keyword,
          verificationStatus: filters.verificationStatus,
        })
      );
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useSupervisors(filters);

  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "state", label: "State" },
      { key: "supervisorType", label: "Supervisor Type" },
      { key: "occupation", label: "Occupation" },
      { key: "specialty", label: "Specialty" },
      { key: "licenseType", label: "License Type" },
      { key: "degreeType", label: "Degree Type" },
      { key: "yearsOfExperience", label: "Experience" },
      { key: "verificationStatus", label: "Status" },
      { key: "createdAt", label: "Submitted" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: "Pending" },
      { value: "APPROVED", label: "Approved" },
      { value: "REJECTED", label: "Rejected" },
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

  const filterChange = useCallback((key: keyof SupervisorFilters, value: any) => {
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

  const viewSupervisor = useCallback(
    (supervisorId: string) => {
      saveScrollPosition();
      saveSearchState();

      if (typeof window !== "undefined") {
        sessionStorage.setItem("supervisor-preserve-state", "true");
        sessionStorage.setItem("supervisor-selected-item", supervisorId);
      }

      router.push(`/admin/supervisors/details/${supervisorId}`);
    },
    [router, saveScrollPosition, saveSearchState]
  );

  const openEditModal = useCallback((supervisorId: string, fullName: string) => {
    setEditModal({ isOpen: true, supervisorId, fullName });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, supervisorId: "", fullName: "" });
  }, []);

  const openApproveModal = useCallback((supervisorId: string, fullName: string) => {
    setApproveNotes("");
    setApproveModal({ isOpen: true, supervisorId, fullName });
  }, []);

  const closeApproveModal = useCallback(() => {
    setApproveNotes("");
    setApproveModal({ isOpen: false, supervisorId: "", fullName: "" });
  }, []);

  const openRejectModal = useCallback((supervisorId: string, fullName: string) => {
    setRejectNotes("");
    setRejectModal({ isOpen: true, supervisorId, fullName });
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({ isOpen: false, supervisorId: "", fullName: "" });
    setRejectNotes("");
  }, []);

  const confirmApprove = useCallback(() => {
    if (!approveModal.supervisorId) return;
    const trimmed = approveNotes.trim();
    approveMutate(
      { id: approveModal.supervisorId, verificationNotes: trimmed ? trimmed : undefined },
      { onSettled: closeApproveModal }
    );
  }, [approveModal.supervisorId, approveNotes, approveMutate, closeApproveModal]);

  const confirmReject = useCallback(() => {
    if (!rejectModal.supervisorId || !rejectNotes.trim()) return;
    rejectMutate(
      { id: rejectModal.supervisorId, verificationNotes: rejectNotes.trim() },
      { onSettled: closeRejectModal }
    );
  }, [rejectModal.supervisorId, rejectNotes, rejectMutate, closeRejectModal]);

  const clearAllFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, keyword: "", verificationStatus: undefined });
    setSearchInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("supervisor-scroll-position");
      localStorage.removeItem("supervisor-search-state");
    }
  }, []);

  const clearIndividualFilter = useCallback(
    (filterType: string) => {
      if (filterType === "verificationStatus") {
        filterChange("verificationStatus", undefined);
      }
    },
    [filterChange]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(searchInput || filters.verificationStatus);
  }, [searchInput, filters.verificationStatus]);

  // Debounced keyword search
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
    initPageChange,
    viewSupervisor,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,

    editModal,
    openEditModal,
    closeEditModal,

    approveModal,
    rejectModal,
    rejectNotes,
    setRejectNotes,
    approveNotes,
    setApproveNotes,
    isApproving,
    isRejecting,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    confirmApprove,
    confirmReject,
  };
};
