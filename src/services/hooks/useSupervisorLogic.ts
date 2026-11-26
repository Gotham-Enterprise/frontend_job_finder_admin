import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSupervisors,
  useApproveSupervisor,
  useRejectSupervisor,
  useResendSupervisorVerification,
  useApproveSupervisorEmailVerification,
  useHideSupervisorProfile,
} from "@/services/hooks/useSupervisors";
import {
  SUBSCRIPTION_DATE_FILTER_KEYS,
  SupervisorFilters,
  SupervisorSortBy,
  SupervisorSubscriptionType,
  VerificationStatus,
} from "@/services/types/supervisor";
import { parseEmailVerifiedFilter } from "@/services/types/emailVerifiedFilter";
import { useSupervisorTypesData } from "./useSupervisees";
import { SupervisorListVariant } from "@/services/types/SupervisorTypes";

const PRECEPTOR_TYPE_NAME = "Preceptor";

/** Per-page config: route, storage keys and the fixed filter sent to the API. */
export const SUPERVISOR_LIST_VARIANTS: Record<
  SupervisorListVariant,
  {
    basePath: string;
    storagePrefix: string;
    labels: { plural: string; singular: string; pluralLower: string };
    /** Sent with every request, never shown in the UI. */
    fixedFilters: Pick<SupervisorFilters, "supervisorType" | "excludeSupervisorType">;
  }
> = {
  supervisors: {
    basePath: "/admin/supervisors",
    storagePrefix: "supervisor",
    labels: { plural: "Supervisors", singular: "supervisor", pluralLower: "supervisors" },
    fixedFilters: { excludeSupervisorType: PRECEPTOR_TYPE_NAME },
  },
  preceptors: {
    basePath: "/admin/preceptors",
    storagePrefix: "preceptor",
    labels: { plural: "Preceptors", singular: "preceptor", pluralLower: "preceptors" },
    fixedFilters: { supervisorType: PRECEPTOR_TYPE_NAME },
  },
};

export const useSupervisorLogic = (variant: SupervisorListVariant = "supervisors") => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = SUPERVISOR_LIST_VARIANTS[variant];
  const { basePath } = config;
  const isPreceptors = variant === "preceptors";
  const stateKey = `${config.storagePrefix}-search-state`;
  const scrollKey = `${config.storagePrefix}-scroll-position`;
  const preserveKey = `${config.storagePrefix}-preserve-state`;
  const selectedKey = `${config.storagePrefix}-selected-item`;

  const getInitialFilters = (): SupervisorFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const keyword = searchParams.get("keyword") || "";
      const statusParam = searchParams.get("verificationStatus");
      const typeParam = isPreceptors ? null : searchParams.get("supervisorType");
      const subscriptionParam = searchParams.get("subscriptionType");
      const validSubscription =
        subscriptionParam && ["PAID", "FREE"].includes(subscriptionParam)
          ? (subscriptionParam as SupervisorSubscriptionType)
          : undefined;
      const validStatus =
        statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam)
          ? (statusParam as VerificationStatus)
          : undefined;
      const emailVerifiedParam = parseEmailVerifiedFilter(searchParams.get("emailVerified"));
      const urlPage = searchParams.get("page");
      const dateParams = Object.fromEntries(
        SUBSCRIPTION_DATE_FILTER_KEYS.map((key) => [key, searchParams.get(key) || undefined])
      );

      const urlFilters: SupervisorFilters = {
        page: Math.max(1, parseInt(urlPage || "1", 10)),
        limit: parseInt(searchParams.get("limit") || "10", 10),
        keyword,
        verificationStatus: validStatus || undefined,
        supervisorType: typeParam || undefined,
        subscriptionType: validSubscription,
        emailVerified: emailVerifiedParam,
        ...dateParams,
      };

      const isSimpleNavigation =
        (!urlPage || urlPage === "1") && !keyword && !statusParam && !typeParam &&
        !subscriptionParam && !emailVerifiedParam &&
        !Object.values(dateParams).some(Boolean);

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem(stateKey);
        localStorage.removeItem(scrollKey);
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem(preserveKey);

      if (navigationFlag === "true") {
        sessionStorage.removeItem(preserveKey);

        const savedState = localStorage.getItem(stateKey);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            return {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 10,
              keyword: parsed.keyword || "",
              verificationStatus: parsed.verificationStatus || undefined,
              supervisorType: parsed.supervisorType || undefined,
              subscriptionType: parsed.subscriptionType || undefined,
              emailVerified: parseEmailVerifiedFilter(parsed.emailVerified),
              ...Object.fromEntries(
                SUBSCRIPTION_DATE_FILTER_KEYS.map((key) => [key, parsed[key] || undefined])
              ),
              sortBy: parsed.sortBy || undefined,
              sortOrder: parsed.sortOrder || undefined,
            };
          } catch {
            // fall through to defaults
          }
        }
      } else {
        localStorage.removeItem(stateKey);
        localStorage.removeItem(scrollKey);
      }
    }

    return { page: 1, limit: 10, keyword: "", verificationStatus: undefined, supervisorType: undefined };
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
  const [resendModal, setResendModal] = useState<{ isOpen: boolean; supervisorId: string; fullName: string }>({
    isOpen: false,
    supervisorId: "",
    fullName: "",
  });
  const [approveEmailModal, setApproveEmailModal] = useState<{
    isOpen: boolean;
    supervisorId: string;
    fullName: string;
  }>({
    isOpen: false,
    supervisorId: "",
    fullName: "",
  });
  const [hideProfileModal, setHideProfileModal] = useState<{
    isOpen: boolean;
    supervisorId: string;
    fullName: string;
    currentlyHidden: boolean;
  }>({ isOpen: false, supervisorId: "", fullName: "", currentlyHidden: false });
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const { mutate: approveMutate, isPending: isApproving } = useApproveSupervisor();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectSupervisor();
  const { mutate: resendMutate, isPending: isResending } = useResendSupervisorVerification();
  const { mutate: approveEmailMutate, isPending: isApprovingEmail } =
    useApproveSupervisorEmailVerification();
  const { mutate: hideProfileMutate, isPending: isHidingProfile } = useHideSupervisorProfile();

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
    if (filters.supervisorType) params.set("supervisorType", filters.supervisorType);
    if (filters.subscriptionType) params.set("subscriptionType", filters.subscriptionType);
    if (filters.emailVerified) params.set("emailVerified", filters.emailVerified);
    SUBSCRIPTION_DATE_FILTER_KEYS.forEach((key) => {
      const value = filters[key];
      if (value) params.set(key, value);
    });

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`${basePath}${newURL}`, { scroll: false });
    }
  }, [filters, router, basePath]);

  // Restore scroll on back navigation
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem(scrollKey);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => window.scrollTo({ top: position, behavior: "smooth" }), 100);
      }
    }
  }, [searchParams]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(scrollKey, window.scrollY.toString());
    }
  }, [scrollKey]);

  const saveSearchState = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        stateKey,
        JSON.stringify({
          page: filters.page,
          limit: filters.limit,
          keyword: filters.keyword,
          verificationStatus: filters.verificationStatus,
          supervisorType: filters.supervisorType,
          subscriptionType: filters.subscriptionType,
          emailVerified: filters.emailVerified,
          ...Object.fromEntries(SUBSCRIPTION_DATE_FILTER_KEYS.map((key) => [key, filters[key]])),
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        })
      );
    }
  }, [filters, stateKey]);

  // The page's fixed scope is applied on top of whatever the user filtered.
  const requestFilters = useMemo(
    () => ({ ...filters, ...config.fixedFilters }),
    [filters, config.fixedFilters]
  );
  const { data, isLoading, error, refetch } = useSupervisors(requestFilters);

  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name", sortKey: "fullName" },
      { key: "state", label: "State", sortKey: "state", className: "text-center" },
      { key: "role", label: "Role" },
      { key: "licenseType", label: "License Type", className: "text-center" },
      { key: "degreeType", label: "Degree Type", className: "text-center" },
      { key: "yearsOfExperience", label: "Experience", sortKey: "yearsOfExperience" },
      { key: "verificationStatus", label: "Status", sortKey: "verificationStatus" },
      { key: "emailVerified", label: "Email Verified" },
      { key: "visibility", label: "Visibility", sortKey: "hideProfile" },
      { key: "subscription", label: "Subscription" },
      { key: "createdAt", label: "Submitted", sortKey: "createdAt" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  const handleSort = useCallback((sortKey: string) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        sortBy: sortKey as SupervisorSortBy,
        // Toggle direction when re-clicking the active column; default to asc.
        sortOrder: prev.sortBy === sortKey && prev.sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      }));
    });
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: "Pending" },
      { value: "APPROVED", label: "Approved" },
      { value: "REJECTED", label: "Rejected" },
    ],
    []
  );

  const subscriptionOptions = useMemo(
    () => [
      { value: "PAID", label: "Paid" },
      { value: "FREE", label: "Free / None" },
    ],
    []
  );

  // Primary-type filter options from the seeded hierarchy (Medical Director,
  // Supervising Physician, ...).
  const { data: supervisorTypesData = [] } = useSupervisorTypesData();
  // Preceptors have their own page, so the Supervisors type filter leaves them out.
  const typeOptions = useMemo(
    () =>
      supervisorTypesData
        .filter((t) => t.name !== PRECEPTOR_TYPE_NAME)
        .map((t) => ({ value: t.name, label: t.name })),
    [supervisorTypesData]
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
        sessionStorage.setItem(preserveKey, "true");
        sessionStorage.setItem(selectedKey, supervisorId);
      }

      router.push(`${basePath}/details/${supervisorId}`);
    },
    [router, saveScrollPosition, saveSearchState, basePath, preserveKey, selectedKey]
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

  const openResendModal = useCallback((supervisorId: string, fullName: string) => {
    setResendModal({ isOpen: true, supervisorId, fullName });
  }, []);

  const closeResendModal = useCallback(() => {
    setResendModal({ isOpen: false, supervisorId: "", fullName: "" });
  }, []);

  const confirmResend = useCallback(() => {
    if (!resendModal.supervisorId) return;
    resendMutate(resendModal.supervisorId, { onSettled: closeResendModal });
  }, [resendModal.supervisorId, resendMutate, closeResendModal]);

  const openApproveEmailModal = useCallback((supervisorId: string, fullName: string) => {
    setApproveEmailModal({ isOpen: true, supervisorId, fullName });
  }, []);

  const closeApproveEmailModal = useCallback(() => {
    setApproveEmailModal({ isOpen: false, supervisorId: "", fullName: "" });
  }, []);

  const confirmApproveEmail = useCallback(() => {
    if (!approveEmailModal.supervisorId) return;
    approveEmailMutate(approveEmailModal.supervisorId, { onSettled: closeApproveEmailModal });
  }, [approveEmailModal.supervisorId, approveEmailMutate, closeApproveEmailModal]);

  const openHideProfileModal = useCallback(
    (supervisorId: string, fullName: string, currentlyHidden: boolean) => {
      setHideProfileModal({ isOpen: true, supervisorId, fullName, currentlyHidden });
    },
    []
  );

  const closeHideProfileModal = useCallback(() => {
    setHideProfileModal({ isOpen: false, supervisorId: "", fullName: "", currentlyHidden: false });
  }, []);

  const confirmHideProfile = useCallback(() => {
    if (!hideProfileModal.supervisorId) return;
    hideProfileMutate(
      { id: hideProfileModal.supervisorId, hideProfile: !hideProfileModal.currentlyHidden },
      { onSettled: closeHideProfileModal }
    );
  }, [
    hideProfileModal.supervisorId,
    hideProfileModal.currentlyHidden,
    hideProfileMutate,
    closeHideProfileModal,
  ]);

  const confirmReject = useCallback(() => {
    if (!rejectModal.supervisorId || !rejectNotes.trim()) return;
    rejectMutate(
      { id: rejectModal.supervisorId, verificationNotes: rejectNotes.trim() },
      { onSettled: closeRejectModal }
    );
  }, [rejectModal.supervisorId, rejectNotes, rejectMutate, closeRejectModal]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      keyword: "",
      verificationStatus: undefined,
      supervisorType: undefined,
      subscriptionType: undefined,
      emailVerified: undefined,
    });
    setSearchInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(scrollKey);
      localStorage.removeItem(stateKey);
    }
  }, [scrollKey, stateKey]);

  const clearIndividualFilter = useCallback(
    (filterType: string) => {
      if (filterType === "verificationStatus") {
        filterChange("verificationStatus", undefined);
      }
      if (filterType === "supervisorType") {
        filterChange("supervisorType", undefined);
      }
      if (filterType === "subscriptionType") {
        filterChange("subscriptionType", undefined);
      }
      if (filterType === "emailVerified") {
        filterChange("emailVerified", undefined);
      }
      if (filterType === "subscriptionDates") {
        startTransition(() => {
          setFilters((prev) => ({
            ...prev,
            ...Object.fromEntries(SUBSCRIPTION_DATE_FILTER_KEYS.map((key) => [key, undefined])),
            page: 1,
          }));
        });
      }
    },
    [filterChange]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.verificationStatus ||
      filters.supervisorType ||
      filters.subscriptionType ||
      filters.emailVerified ||
      SUBSCRIPTION_DATE_FILTER_KEYS.some((key) => filters[key])
    );
  }, [searchInput, filters]);

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
    variant,
    labels: config.labels,
    basePath,
    showTypeFilter: !isPreceptors,

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
    typeOptions,
    subscriptionOptions,
    itemsPerPageOptions,

    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    handleSort,

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

    resendModal,
    isResending,
    openResendModal,
    closeResendModal,
    confirmResend,

    approveEmailModal,
    isApprovingEmail,
    openApproveEmailModal,
    closeApproveEmailModal,
    confirmApproveEmail,

    hideProfileModal,
    isHidingProfile,
    openHideProfileModal,
    closeHideProfileModal,
    confirmHideProfile,
  };
};
