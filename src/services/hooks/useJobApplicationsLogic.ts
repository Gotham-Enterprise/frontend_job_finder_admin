import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobApplications, useViewApplicationResume } from "@/services/hooks/useJobApplications";
import { useStates } from "@/services/hooks/useStates";
import { openFileInNewTab } from "@/services/utils/fileUtils";
import { JobApplicationFilters } from "@/services/types/jobApplication";

export const useJobApplicationsLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobApplicationFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const nameParam = searchParams.get("name") || "";
      const decodedName = nameParam ? decodeURIComponent(nameParam) : "";
      const urlPage = searchParams.get("page");
      const urlState = searchParams.get("state");
      const urlCity = searchParams.get("city");
      const urlCompanyName = searchParams.get("companyName");
      const urlStatus = searchParams.get("status");

      const urlFilters = {
        page: Math.max(1, parseInt(urlPage || "1", 10)),
        limit: parseInt(searchParams.get("limit") || "100", 10),
        name: decodedName,
        state: urlState || "",
        city: urlCity || "",
        companyName: urlCompanyName || "",
        status: urlStatus || "",
      };

      const isSimpleNavigation =
        (!urlPage || urlPage === "1") && !decodedName && !urlState && !urlCity && !urlCompanyName && !urlStatus;

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem("jobApplications-search-state");
        localStorage.removeItem("jobApplications-scroll-position");
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem("jobApplications-preserve-state");

      if (navigationFlag === "true") {
        sessionStorage.removeItem("jobApplications-preserve-state");

        const savedState = localStorage.getItem("jobApplications-search-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            return {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 100,
              name: parsed.name || "",
              state: parsed.state || "",
              city: parsed.city || "",
              companyName: parsed.companyName || "",
              status: parsed.status || "",
            };
          } catch (error) {
            console.warn("Failed to parse saved job applications state:", error);
          }
        }
      } else {
        localStorage.removeItem("jobApplications-search-state");
        localStorage.removeItem("jobApplications-scroll-position");
      }
    }

    return {
      page: 1,
      limit: 100,
      name: "",
      state: "",
      city: "",
      companyName: "",
      status: "",
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobApplicationFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    // Always initialize with empty search input for cleaner UI
    // The actual filtering will be handled by the filters state
    return "";
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.status ? [initialFilters.status] : []
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);
  const [isFromJobSeeker, setIsFromJobSeeker] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
    if (initialFilters.name || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }

    // Check if user came from JobSeeker page (has name parameter in URL)
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    const nameParam = searchParams.get("name");
    if (hasUrlParams && nameParam) {
      setIsFromJobSeeker(true);
    }
  }, [initialFilters.name, initialFilters.page, searchParams]);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobApplications-scroll-position");
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: "smooth" });
        }, 100);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        const hasUrlParams = Array.from(new URLSearchParams(window.location.search).keys()).length > 0;

        if (!hasUrlParams && typeof window !== "undefined") {
          const savedPosition = localStorage.getItem("jobApplications-scroll-position");
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: "smooth" });
          }
        }
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const { data, isLoading, error, refetch } = useJobApplications(filters);
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewApplicationResume();

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set("limit", filters.limit.toString());
    if (filters.name) params.set("name", encodeURIComponent(filters.name));
    if (filters.city) params.set("city", filters.city);
    if (filters.state) params.set("state", filters.state);
    if (filters.companyName) params.set("companyName", filters.companyName);
    if (filters.status) params.set("status", filters.status);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/applications${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const position = window.scrollY;
      localStorage.setItem("jobApplications-scroll-position", position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobApplications-scroll-position");
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setTimeout(() => {
          window.scrollTo({ top: position, behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  const saveSearchState = useCallback(() => {
    if (typeof window !== "undefined") {
      const stateToSave = {
        page: filters.page,
        limit: filters.limit,
        name: filters.name,
        city: filters.city,
        state: filters.state,
        companyName: filters.companyName,
        status: filters.status,
      };
      localStorage.setItem("jobApplications-search-state", JSON.stringify(stateToSave));
    }
  }, [filters]);

  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Applicant" },
      { key: "company", label: "Company" },
      { key: "location", label: "Location" },
      { key: "resume", label: "Resume" },
      { key: "applicationDate", label: "Application Date" },
      { key: "status", label: "Status" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "New Application", label: "New Application" },
      { value: "Assessment", label: "Assessment" },
      { value: "Pre-Screening", label: "Pre-Screening" },
      { value: "Training", label: "Training" },
      { value: "Completed", label: "Completed" },
      { value: "Interview", label: "Interview" },
    ],
    []
  );

  const stateOptions = useMemo(() => {
    if (!statesData?.success || !statesData?.data?.states) {
      return [{ value: "", label: "All States" }];
    }

    return [
      { value: "", label: "All States" },
      ...statesData.data.states.map((state: any) => ({
        value: state.abbreviation,
        label: state.name,
      })),
    ];
  }, [statesData]);

  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
      { value: "100", label: "100 per page" },
    ],
    []
  );

  const filterChange = useMemo(
    () => (key: keyof JobApplicationFilters, value: any) => {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          [key]: value === "" ? undefined : value,
          page: 1,
        }));
      });
    },
    []
  );

  const handleStatusToggle = useMemo(
    () => (statuses: string[]) => {
      setSelectedStatuses(statuses);

      startTransition(() => {
        if (statuses.length === 0) {
          setFilters((prev) => ({ ...prev, status: "", page: 1 }));
        } else if (statuses.length === 1) {
          setFilters((prev) => ({ ...prev, status: statuses[0], page: 1 }));
        } else {
          setFilters((prev) => ({ ...prev, status: "", page: 1 }));
        }
      });
    },
    []
  );

  const initPageChange = useMemo(
    () => (newPage: number) => {
      startTransition(() => {
        setFilters((prev) => ({ ...prev, page: newPage }));
      });
    },
    []
  );

  const getStatusVariant = useMemo(
    () =>
      (status: string): "light" | "solid" => {
        switch (status.toLowerCase()) {
          case "new application":
            return "solid";
          case "under review":
            return "solid";
          case "interview scheduled":
            return "solid";
          case "offer extended":
            return "solid";
          case "hired":
            return "solid";
          case "rejected":
            return "light";
          case "withdrawn":
            return "light";
          default:
            return "light";
        }
      },
    []
  );

  const initViewResume = async (resumeObjectKey: string, fileName?: string) => {
    if (!resumeObjectKey) {
      console.error("No resume object key provided");
      return;
    }

    viewResume(resumeObjectKey, {
      onSuccess: (data: any) => {
        if (data?.success && data?.data?.fileUrl) {
          openFileInNewTab(data.data.fileUrl, fileName);
        } else if (data?.fileUrl) {
          openFileInNewTab(data.fileUrl, fileName);
        } else {
          console.error("No file URL found in response", data);
        }
      },
      onError: (error) => {
        console.error("Error viewing resume:", error);
      },
    });
  };

  const viewJobApplication = useCallback(
    (jobApplicationId: string) => {
      saveScrollPosition();
      saveSearchState();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("jobApplications-preserve-state", "true");
        sessionStorage.setItem("jobApplications-selected-item", jobApplicationId);
      }

      router.push(`/admin/applications/details/${jobApplicationId}`);
    },
    [router, saveScrollPosition, saveSearchState]
  );

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      name: "",
      city: "",
      state: "",
      companyName: "",
      status: "",
    };
    setFilters(newFilters);
    setSearchInput("");
    setSelectedStatuses([]);
    setIsFromJobSeeker(false); // Reset JobSeeker flag when manually clearing
    if (typeof window !== "undefined") {
      localStorage.removeItem("jobApplications-scroll-position");
      localStorage.removeItem("jobApplications-search-state");
    }
  }, []);

  const clearIndividualFilter = useCallback(
    (filterType: string) => {
      switch (filterType) {
        case "city":
          filterChange("city", "");
          break;
        case "state":
          filterChange("state", "");
          break;
        case "status":
          setSelectedStatuses([]);
          filterChange("status", "");
          break;
        default:
          break;
      }
    },
    [filterChange]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(filters.name || filters.state || filters.city || filters.companyName || selectedStatuses.length > 0);
  }, [filters.name, filters.state, filters.city, filters.companyName, selectedStatuses]);

  useEffect(() => {
    if (data && !isLoading) {
      const hasUrlParams = searchParams.toString();

      if (hasUrlParams) {
        restoreScrollPosition();
      } else {
        import("@/services/utils/autoScroll").then(({ restoreScrollWithItemHighlight }) => {
          restoreScrollWithItemHighlight("jobApplications-selected-item", "jobApplications-scroll-position");
        });
      }
    }
  }, [data, isLoading, searchParams, restoreScrollPosition]);

  useEffect(() => {
    const isOnPageOneWithNoFilters =
      filters.page === 1 && !filters.name && !filters.state && !filters.city && !filters.companyName && !filters.status;

    if (isOnPageOneWithNoFilters) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("jobApplications-search-state");
        localStorage.removeItem("jobApplications-scroll-position");
      }
    } else if (
      filters.name ||
      filters.state ||
      filters.city ||
      filters.companyName ||
      filters.status ||
      (filters.page && filters.page > 1)
    ) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

  useEffect(() => {
    if (!isInitialized) return;

    // If user came from JobSeeker page, ensure the filter is set but don't update searchInput
    if (isFromJobSeeker && initialFilters.name) {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          name: initialFilters.name,
          page: 1,
        }));
        setIsFromJobSeeker(false); // Reset the flag after triggering
      });
      return;
    }

    // Only handle search input changes for manual searches (not from JobSeeker navigation)
    if (hasRestoredFromState && searchInput === initialFilters.name) return;

    // Don't clear filters if searchInput is empty and we have an active filter from JobSeeker
    if (!searchInput && filters.name && initialFilters.name) {
      return; // Keep the existing filter, don't clear it
    }

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        const shouldResetPage = searchInput !== filters.name;
        setFilters((prev) => ({
          ...prev,
          name: searchInput,
          page: shouldResetPage ? 1 : prev.page,
        }));
        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.name, hasRestoredFromState, initialFilters.name, isFromJobSeeker]);

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
    statesData,
    isStatesLoading,
    isViewingResume,

    tableColumns,
    statusOptions,
    stateOptions,
    itemsPerPageOptions,

    filterChange,
    handleStatusToggle,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobApplication,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    selectedStatuses,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
