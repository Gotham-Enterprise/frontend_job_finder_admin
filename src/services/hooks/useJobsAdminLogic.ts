import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobsAdmin, useJobsAdminOccupations, useSoftDeleteJob } from "@/services/hooks/useJobsAdmin";
import { useStates } from "@/services/hooks/useStates";
import { useCitiesByState } from "@/lib/useStatesCities";
import { JobsAdminFilters, Specialty } from "@/services/types/jobsAdmin";

export const useJobsAdminLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobsAdminFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (hasUrlParams) {
      const urlPage = searchParams.get("page");
      const urlLimit = searchParams.get("limit");
      const urlName = searchParams.get("name");
      const urlState = searchParams.get("state");
      const urlCity = searchParams.get("city");
      const urlJobStatus = searchParams.get("jobStatus");
      const urlDatePosted = searchParams.get("datePosted");
      const urlOccupationId = searchParams.get("occupationId");
      const urlSpecialtyId = searchParams.get("specialtyId");
      const urlCompanyName = searchParams.get("companyName");
      const urlIsDeleted = searchParams.get("isDeleted");

      const urlFilters: JobsAdminFilters = {
        page: urlPage ? Math.max(1, parseInt(urlPage, 10)) : 1,
        limit: urlLimit ? parseInt(urlLimit, 10) : 100,
        name: urlName || "",
        state: urlState || "",
        city: urlCity || "",
        jobStatus:
          urlJobStatus === "Draft" || urlJobStatus === "Published"
            ? (urlJobStatus as "Draft" | "Published")
            : undefined,
        datePosted: urlDatePosted || "",
        occupationId: urlOccupationId ? parseInt(urlOccupationId) : undefined,
        specialtyId: urlSpecialtyId ? parseInt(urlSpecialtyId) : undefined,
        companyName: urlCompanyName || "",
        isDeleted: urlIsDeleted === "true" || urlIsDeleted === "all" ? urlIsDeleted : undefined,
      };

      const isSimpleNavigation =
        (!urlPage || urlPage === "1") &&
        !urlName &&
        !urlState &&
        !urlCity &&
        !urlDatePosted &&
        !urlOccupationId &&
        !urlSpecialtyId &&
        !urlCompanyName;

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem("jobsAdmin-search-state");
        localStorage.removeItem("jobsAdmin-scroll-position");
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem("jobsAdmin-preserve-state");

      if (navigationFlag === "true") {
        sessionStorage.removeItem("jobsAdmin-preserve-state");

        const savedState = localStorage.getItem("jobsAdmin-search-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            const restoredFilters = {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 100,
              name: parsed.name || "",
              state: parsed.state || "",
              city: parsed.city || "",
              jobStatus: parsed.jobStatus || undefined,
              datePosted: parsed.datePosted || "",
              occupationId: parsed.occupationId || undefined,
              specialtyId: parsed.specialtyId || undefined,
              companyName: parsed.companyName || "",
              isDeleted: parsed.isDeleted || undefined,
            };

            return restoredFilters;
          } catch (error) {
            console.warn("Failed to parse saved jobs admin state:", error);
          }
        }
      } else {
        localStorage.removeItem("jobsAdmin-search-state");
        localStorage.removeItem("jobsAdmin-scroll-position");
      }
    }
    return {
      page: 1,
      limit: 100,
      name: "",
      state: "",
      city: "",
      jobStatus: undefined,
      datePosted: "",
      occupationId: undefined,
      specialtyId: undefined,
      companyName: "",
      isDeleted: undefined,
    };
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobsAdminFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.name || "");
  const [companyNameInput, setCompanyNameInput] = useState(initialFilters.companyName || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(initialFilters.occupationId);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>(
    initialFilters.jobStatus ? [initialFilters.jobStatus] : []
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);
  const [initialSearchValue, setInitialSearchValue] = useState(initialFilters.name || "");
  const softDeleteMutation = useSoftDeleteJob();
  const [deleteConfirmJobId, setDeleteConfirmJobId] = useState<string | null>(null);

  useEffect(() => {
    setIsInitialized(true);

    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (hasUrlParams || initialFilters.name || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.name, initialFilters.page, searchParams]);

  useEffect(() => {
    if (!isInitialized) return;

    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    const urlPage = searchParams.get("page");

    if (hasUrlParams && !urlPage && filters.page && filters.page > 1) {
      const params = new URLSearchParams(window.location.search);
      params.set("page", filters.page.toString());

      const newURL = `?${params.toString()}`;
      router.replace(`/admin/jobs${newURL}`, { scroll: false });
    }
  }, [isInitialized, searchParams, filters.page, router]);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobsAdmin-scroll-position");
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
          const savedPosition = localStorage.getItem("jobsAdmin-scroll-position");
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: "smooth" });
          }
        }
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [searchParams]);

  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set("limit", filters.limit.toString());
    if (filters.name) params.set("name", filters.name);
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);
    if (filters.jobStatus) params.set("jobStatus", filters.jobStatus);
    if (filters.datePosted) params.set("datePosted", filters.datePosted);
    if (filters.occupationId) params.set("occupationId", filters.occupationId.toString());
    if (filters.specialtyId) params.set("specialtyId", filters.specialtyId.toString());
    if (filters.companyName) params.set("companyName", filters.companyName);
    if (filters.isDeleted) params.set("isDeleted", filters.isDeleted);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/jobs${newURL}`, { scroll: false });
    }
  }, [filters, router, isInitialized]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const position = window.scrollY;
      localStorage.setItem("jobsAdmin-scroll-position", position.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobsAdmin-scroll-position");
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
        state: filters.state,
        city: filters.city,
        jobStatus: filters.jobStatus,
        datePosted: filters.datePosted,
        occupationId: filters.occupationId,
        specialtyId: filters.specialtyId,
        companyName: filters.companyName,
        isDeleted: filters.isDeleted,
      };
      localStorage.setItem("jobsAdmin-search-state", JSON.stringify(stateToSave));
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useJobsAdmin(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useJobsAdminOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();

  const getStateAbbreviation = (formattedState: string) => {
    const match = formattedState.match(/\(([^)]+)\)$/);
    return match ? match[1] : formattedState;
  };
  const stateAbbr = filters.state ? getStateAbbreviation(filters.state) : "";
  const { data: cities, isLoading: isLoadingCities } = useCitiesByState(stateAbbr);

  const cityOptions = useMemo(() => {
    if (!cities || !filters.state) return [];
    return cities.map((city) => ({ value: city, label: city }));
  }, [cities, filters.state]);

  const tableColumns = useMemo(
    () => [
      { key: "jobId", label: "Job ID" },
      { key: "title", label: "Job Title" },
      { key: "company", label: "Company" },
      { key: "occupation", label: "Occupation" },
      { key: "location", label: "Location" },
      { key: "datePosted", label: "Date Posted" },
      { key: "status", label: "Status" },
      { key: "jobStatus", label: "Job Status" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  const jobStatusOptions = useMemo(
    () => [
      { value: "", label: "All Job Status" },
      { value: "Draft", label: "Draft" },
      { value: "Published", label: "Published" },
    ],
    []
  );

  const occupationOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All Occupations" }];

    if (occupationsData?.success && occupationsData.data) {
      // Create a Map to deduplicate by name (keep first occurrence)
      const uniqueOccupations = new Map();

      occupationsData.data.forEach((occupation) => {
        if (!uniqueOccupations.has(occupation.name)) {
          uniqueOccupations.set(occupation.name, {
            value: occupation.id.toString(),
            label: occupation.name,
          });
        }
      });

      const dynamicOptions = Array.from(uniqueOccupations.values());
      return [...baseOptions, ...dynamicOptions];
    }

    return baseOptions;
  }, [occupationsData]);

  const specialtyOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All Specialties" }];

    if (selectedOccupationId && occupationsData?.success && occupationsData.data) {
      const selectedOccupation = occupationsData.data.find((occupation) => occupation.id === selectedOccupationId);

      if (selectedOccupation?.specialty) {
        // Create a Map to deduplicate by name (keep first occurrence)
        const uniqueSpecialties = new Map();

        selectedOccupation.specialty.forEach((specialty: Specialty) => {
          if (!uniqueSpecialties.has(specialty.name)) {
            uniqueSpecialties.set(specialty.name, {
              value: specialty.id.toString(),
              label: specialty.name,
            });
          }
        });

        const dynamicOptions = Array.from(uniqueSpecialties.values());
        return [...baseOptions, ...dynamicOptions];
      }
    }

    return baseOptions;
  }, [selectedOccupationId, occupationsData]);

  const stateOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All States" }];

    if (statesData?.success && statesData.data) {
      const dynamicOptions = statesData.data.states.map((state) => ({
        value: state.abbreviation,
        label: state.name,
      }));
      return [...baseOptions, ...dynamicOptions];
    }

    return baseOptions;
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
    () => (key: keyof JobsAdminFilters, value: any) => {
      startTransition(() => {
        let processedValue = value;

        if (key === "occupationId" || key === "specialtyId") {
          processedValue = value === "" ? undefined : parseInt(value);
        } else if (key === "limit") {
          processedValue = parseInt(value);
        } else if (key === "jobStatus") {
          processedValue = value === "" ? undefined : value;
        } else {
          processedValue = value === "" ? undefined : value;
        }

        const newFilters = {
          ...filters,
          [key]: processedValue,
          ...(key !== "page" && key !== "limit" && { page: 1 }),
          ...(key === "occupationId" && { specialtyId: undefined }),
          ...(key === "state" && { city: "" }),
        };
        setFilters(newFilters);

        if (key === "occupationId") {
          setSelectedOccupationId(value === "" ? undefined : parseInt(value));
        }
      });
    },
    [filters]
  );

  const jobStatusToggle = useCallback((statuses: string[]) => {
    setSelectedJobStatuses(statuses);
    startTransition(() => {
      const jobStatus = statuses.length > 0 ? (statuses[0] as "Draft" | "Published") : undefined;
      setFilters((prev) => ({
        ...prev,
        jobStatus,
        ...(prev.jobStatus !== jobStatus && { page: 1 }),
      }));
    });
  }, []);

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
        switch (status?.toLowerCase()) {
          case "open":
            return "solid";
          case "closed":
            return "light";
          case "paused":
            return "light";
          default:
            return "light";
        }
      },
    []
  );

  const getJobStatusVariant = useMemo(
    () =>
      (jobStatus: string): "light" | "solid" => {
        switch (jobStatus?.toLowerCase()) {
          case "published":
            return "solid";
          case "deleted":
            return "light";
          case "draft":
            return "light";
          default:
            return "light";
        }
      },
    []
  );

  const viewJobDetails = useCallback(
    (jobId: string) => {
      saveScrollPosition();
      saveSearchState();

      if (typeof window !== "undefined") {
        sessionStorage.setItem("jobsAdmin-preserve-state", "true");
        sessionStorage.setItem("jobsAdmin-selected-item", jobId);
      }

      router.push(`/admin/jobs/details/${jobId}`);
    },
    [router, saveScrollPosition, saveSearchState]
  );

  const editJobPost = (jobId: string) => {
    router.push(`/admin/jobs/edit-job?id=${jobId}`);
  };

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      name: "",
      state: "",
      city: "",
      jobStatus: undefined,
      datePosted: "",
      occupationId: undefined,
      specialtyId: undefined,
      companyName: "",
      isDeleted: undefined,
    };
    setFilters(newFilters);
    setSearchInput("");
    setCompanyNameInput("");
    setSelectedOccupationId(undefined);
    setSelectedJobStatuses([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("jobsAdmin-scroll-position");
      localStorage.removeItem("jobsAdmin-search-state");
    }
  }, []);

  const clearIndividualFilter = useCallback(
    (filterKey: keyof JobsAdminFilters) => {
      startTransition(() => {
        const updatedFilters = { ...filters };

        switch (filterKey) {
          case "name":
            updatedFilters.name = "";
            setSearchInput("");
            break;
          case "state":
            updatedFilters.state = "";
            updatedFilters.city = "";
            break;
          case "city":
            updatedFilters.city = "";
            break;
          case "jobStatus":
            updatedFilters.jobStatus = undefined;
            setSelectedJobStatuses([]);
            break;
          case "datePosted":
            updatedFilters.datePosted = "";
            break;
          case "occupationId":
            updatedFilters.occupationId = undefined;
            updatedFilters.specialtyId = undefined;
            setSelectedOccupationId(undefined);
            break;
          case "specialtyId":
            updatedFilters.specialtyId = undefined;
            break;
          case "companyName":
            updatedFilters.companyName = "";
            setCompanyNameInput("");
            break;
          case "isDeleted":
            updatedFilters.isDeleted = undefined;
            break;
          default:
            break;
        }

        updatedFilters.page = 1;
        setFilters(updatedFilters);
      });
    },
    [filters]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      companyNameInput ||
      filters.state ||
      filters.city ||
      filters.jobStatus ||
      filters.datePosted ||
      filters.occupationId ||
      filters.specialtyId ||
      filters.isDeleted ||
      selectedJobStatuses.length > 0
    );
  }, [
    searchInput,
    companyNameInput,
    filters.state,
    filters.city,
    filters.jobStatus,
    filters.datePosted,
    filters.occupationId,
    filters.specialtyId,
    filters.isDeleted,
    selectedJobStatuses,
  ]);

  useEffect(() => {
    if (data && !isLoading) {
      const hasUrlParams = searchParams.toString();

      if (hasUrlParams) {
        restoreScrollPosition();
      } else {
        import("@/services/utils/autoScroll").then(({ restoreScrollWithItemHighlight }) => {
          restoreScrollWithItemHighlight("jobsAdmin-selected-item", "jobsAdmin-scroll-position");
        });
      }
    }
  }, [data, isLoading, searchParams, restoreScrollPosition]);

  useEffect(() => {
    if (!isInitialized) return;
    const isOnPageOneWithNoFilters =
      filters.page === 1 &&
      !filters.name &&
      !filters.state &&
      !filters.city &&
      !filters.jobStatus &&
      !filters.datePosted &&
      !filters.occupationId &&
      !filters.specialtyId &&
      !filters.companyName;

    if (isOnPageOneWithNoFilters && !filters.isDeleted) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("jobsAdmin-search-state");
        localStorage.removeItem("jobsAdmin-scroll-position");
      }
    } else if (
      filters.name ||
      filters.state ||
      filters.city ||
      filters.jobStatus ||
      filters.datePosted ||
      filters.occupationId ||
      filters.specialtyId ||
      filters.companyName ||
      filters.isDeleted ||
      (filters.page && filters.page > 1)
    ) {
      saveSearchState();
    }
  }, [filters, saveSearchState, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (hasRestoredFromState && searchInput === initialSearchValue) {
      return;
    }

    if (searchInput === filters.name) {
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          name: searchInput,
          ...(searchInput !== prev.name && { page: 1 }),
        }));

        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.name, hasRestoredFromState, initialSearchValue]);

  useEffect(() => {
    if (!isInitialized) return;

    if (companyNameInput === filters.companyName) {
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          companyName: companyNameInput,
          ...(companyNameInput !== prev.companyName && { page: 1 }),
        }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [companyNameInput, isInitialized, filters.companyName]);

  const deleteJobPost = useCallback(
    (jobId: string) => {
      setDeleteConfirmJobId(jobId);
    },
    []
  );

  const confirmDeleteJobPost = useCallback(
    async () => {
      if (!deleteConfirmJobId) return;
      await softDeleteMutation.mutateAsync(deleteConfirmJobId);
      setDeleteConfirmJobId(null);
    },
    [deleteConfirmJobId, softDeleteMutation]
  );

  const cancelDeleteJobPost = useCallback(() => {
    setDeleteConfirmJobId(null);
  }, []);

  return {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    selectedOccupationId,

    data,
    isLoading,
    error,
    refetch,
    occupationsData,
    isOccupationsLoading,
    statesData,
    isStatesLoading,

    tableColumns,
    jobStatusOptions,
    occupationOptions,
    specialtyOptions,
    stateOptions,
    cityOptions,
    isLoadingCities,
    itemsPerPageOptions,

    filterChange,
    jobStatusToggle,
    initPageChange,
    getStatusVariant,
    getJobStatusVariant,
    viewJobDetails,
    editJobPost,
    deleteJobPost,
    confirmDeleteJobPost,
    cancelDeleteJobPost,
    isDeleteDialogOpen: !!deleteConfirmJobId,
    isDeletingJob: softDeleteMutation.isPending,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    selectedJobStatuses,
    companyNameInput,
    setCompanyNameInput,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
