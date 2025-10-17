import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobSeekers } from "@/services/hooks/useJobSeekers";
import { useOccupations } from "@/services/hooks/useOccupations";
import { useStates } from "@/services/hooks/useStates";
import { useLicenses, useLicenseIssuingStates } from "@/services/hooks/useLicenses";
import { jobApplicationApi } from "@/services/api/jobApplication";
import { JobSeekerFilters } from "@/services/types/jobSeeker";

export const useJobSeekersLogic = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): JobSeekerFilters => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    if (hasUrlParams) {
      const searchParam = searchParams.get("search") || "";
      const decodedSearch = searchParam ? decodeURIComponent(searchParam) : "";
      const statusParam = searchParams.get("status");
      const validStatus =
        statusParam && ["active", "inactive", "pending", "suspended"].includes(statusParam)
          ? (statusParam as "active" | "inactive" | "pending" | "suspended")
          : undefined;
      const urlPage = searchParams.get("page");
      const urlLocation = searchParams.get("location");
      const urlCity = searchParams.get("city");
      const urlRadius = searchParams.get("radius");
      const urlOccupationId = searchParams.get("occupationId");
      const urlLicenseName = searchParams.get("licenseName");
      const urlLicenseIssuingState = searchParams.get("licenseIssuingState");

      const urlFilters = {
        page: Math.max(1, parseInt(urlPage || "1", 10)),
        limit: parseInt(searchParams.get("limit") || "100", 10),
        search: decodedSearch,
        city: urlCity || "",
        radius: urlRadius ? parseInt(urlRadius, 10) : undefined,
        location: urlLocation || "",
        occupationId: urlOccupationId ? parseInt(urlOccupationId, 10) : undefined,
        status: validStatus,
        licenseName: urlLicenseName || "",
        licenseIssuingState: urlLicenseIssuingState || "",
      };
      const isSimpleNavigation =
        (!urlPage || urlPage === "1") &&
        !decodedSearch &&
        !urlCity &&
        !urlRadius &&
        !urlLocation &&
        !urlOccupationId &&
        !validStatus &&
        !urlLicenseName &&
        !urlLicenseIssuingState;

      if (isSimpleNavigation && typeof window !== "undefined") {
        localStorage.removeItem("jobseeker-search-state");
        localStorage.removeItem("jobseeker-scroll-position");
      }

      return urlFilters;
    }

    if (typeof window !== "undefined") {
      const navigationFlag = sessionStorage.getItem("jobseeker-preserve-state");

      if (navigationFlag === "true") {
        sessionStorage.removeItem("jobseeker-preserve-state");

        const savedState = localStorage.getItem("jobseeker-search-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            const restoredFilters = {
              page: Math.max(1, parsed.page || 1),
              limit: parsed.limit || 100,
              search: parsed.search || "",
              city: parsed.city || "",
              radius: parsed.radius || undefined,
              location: parsed.location || "",
              occupationId: parsed.occupationId || undefined,
              status: parsed.status || undefined,
              licenseName: parsed.licenseName || "",
              licenseIssuingState: parsed.licenseIssuingState || "",
            };
            return restoredFilters;
          } catch (error) {
            console.warn("Failed to parse saved job seeker state:", error);
          }
        }
      } else {
        localStorage.removeItem("jobseeker-search-state");
        localStorage.removeItem("jobseeker-scroll-position");
      }
    }

    const defaultFilters = {
      page: 1,
      limit: 100,
      search: "",
      city: "",
      radius: undefined,
      location: "",
      occupationId: undefined,
      status: undefined,
      licenseName: "",
      licenseIssuingState: "",
    };
    return defaultFilters;
  };

  const initialFilters = getInitialFilters();
  const [filters, setFilters] = useState<JobSeekerFilters>(() => {
    return initialFilters;
  });
  const [searchInput, setSearchInput] = useState(() => {
    const initial = initialFilters.search || "";
    return initial;
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isViewingResume, setIsViewingResume] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestoredFromState, setHasRestoredFromState] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
    if (initialFilters.search || (initialFilters.page && initialFilters.page > 1)) {
      setHasRestoredFromState(true);
    }
  }, [initialFilters.search, initialFilters.page]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 100) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", encodeURIComponent(filters.search));
    if (filters.city) params.set("city", filters.city);
    if (filters.radius) params.set("radius", filters.radius.toString());
    if (filters.location) params.set("location", filters.location);
    if (filters.occupationId) params.set("occupationId", filters.occupationId.toString());
    if (filters.status) params.set("status", filters.status);
    if (filters.licenseName) params.set("licenseName", filters.licenseName);
    if (filters.licenseIssuingState) params.set("licenseIssuingState", filters.licenseIssuingState);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(`/admin/job-seekers${newURL}`, { scroll: false });
    }
  }, [filters, router]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (!hasUrlParams && typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobseeker-scroll-position");
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
          const savedPosition = localStorage.getItem("jobseeker-scroll-position");
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

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const position = window.scrollY;
      localStorage.setItem("jobseeker-scroll-position", position.toString());
      setScrollPosition(position);
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("jobseeker-scroll-position");
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
        search: filters.search,
        city: filters.city,
        radius: filters.radius,
        location: filters.location,
        occupationId: filters.occupationId,
        status: filters.status,
      };
      localStorage.setItem("jobseeker-search-state", JSON.stringify(stateToSave));
    }
  }, [filters]);

  const { data, isLoading, error, refetch } = useJobSeekers(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: licensesData, isLoading: isLicensesLoading } = useLicenses();
  const { data: licenseStatesData, isLoading: isLicenseStatesLoading } = useLicenseIssuingStates();
  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "occupation", label: "Occupation" },
      { key: "specialty", label: "Specialty" },
      { key: "state", label: "Location" },
      { key: "licenses", label: "Licenses" },
      { key: "certifications", label: "Certifications" },
      { key: "resume", label: "Resume" },
      { key: "dateJoined", label: "Registration date" },
      { key: "lastActivity", label: "Last Activity" },
      { key: "status", label: "Status" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );
  const statusOptions = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
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

  const licenseOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All Licenses" }];

    if (licensesData?.success && licensesData.data) {
      const dynamicOptions = licensesData.data.map((license) => ({
        value: license.name,
        label: license.name,
      }));
      return [...baseOptions, ...dynamicOptions];
    }

    return baseOptions;
  }, [licensesData]);

  const licenseStateOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All Issuing States" }];

    if (licenseStatesData?.success && licenseStatesData.data) {
      const dynamicOptions = licenseStatesData.data.map((state) => ({
        value: state.name,
        label: state.name,
      }));
      return [...baseOptions, ...dynamicOptions];
    }

    return baseOptions;
  }, [licenseStatesData]);

  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
      { value: "100", label: "100 per page" },
    ],
    []
  );

  const filterChange = useCallback((key: keyof JobSeekerFilters, value: any) => {
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
  const getStatusVariant = useMemo(
    () =>
      (status: string): "light" | "solid" => {
        switch (status) {
          case "active":
            return "solid";
          case "inactive":
            return "light";
          case "suspended":
            return "solid";
          case "pending":
            return "light";
          default:
            return "light";
        }
      },
    []
  );

  const initViewResume = useCallback(async (objectKey: string | null, fileName?: string) => {
    if (!objectKey) {
      console.error("No object key provided");
      return;
    }

    setIsViewingResume(true);
    try {
      const response = await jobApplicationApi.viewResume(objectKey);
      if (response.success && response.data?.fileUrl) {
        const { openFileInNewTab } = await import("../utils/fileUtils");
        openFileInNewTab(response.data.fileUrl, fileName);
      } else {
        console.error("No file URL found in response");
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
    } finally {
      setIsViewingResume(false);
    }
  }, []);
  const viewJobSeeker = useCallback(
    (jobSeekerId: string) => {
      saveScrollPosition();
      saveSearchState();

      if (typeof window !== "undefined") {
        sessionStorage.setItem("jobseeker-preserve-state", "true");
        sessionStorage.setItem("jobseeker-selected-item", jobSeekerId);
      }

      router.push(`/admin/job-seekers/details/${jobSeekerId}`);
    },
    [router, saveScrollPosition, saveSearchState]
  );

  const clearAllFilters = useCallback(() => {
    const newFilters = {
      page: 1,
      limit: 100,
      search: "",
      city: "",
      radius: undefined,
      location: "",
      occupationId: undefined,
      status: undefined,
      licenseName: "",
      licenseIssuingState: "",
    };
    setFilters(newFilters);
    setSearchInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("jobseeker-scroll-position");
      localStorage.removeItem("jobseeker-search-state");
    }
  }, []);

  const clearIndividualFilter = useCallback(
    (filterType: string) => {
      switch (filterType) {
        case "occupationId":
          filterChange("occupationId", undefined);
          break;
        case "city":
          filterChange("city", "");
          break;
        case "radius":
          filterChange("radius", undefined);
          break;
        case "location":
          filterChange("location", "");
          break;
        case "status":
          filterChange("status", undefined);
          break;
        case "licenseName":
          filterChange("licenseName", "");
          break;
        case "licenseIssuingState":
          filterChange("licenseIssuingState", "");
          break;
        default:
          break;
      }
    },
    [filterChange]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchInput ||
      filters.city ||
      filters.radius ||
      filters.location ||
      filters.occupationId ||
      filters.status ||
      filters.licenseName ||
      filters.licenseIssuingState
    );
  }, [searchInput, filters.city, filters.radius, filters.location, filters.occupationId, filters.status]);

  useEffect(() => {
    if (!isInitialized) return;

    if (hasRestoredFromState && searchInput === initialFilters.search) return;

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        const shouldResetPage = searchInput !== filters.search;
        setFilters((prev) => ({
          ...prev,
          search: searchInput,
          page: shouldResetPage ? 1 : prev.page,
        }));

        if (hasRestoredFromState) {
          setHasRestoredFromState(false);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, isInitialized, filters.search, hasRestoredFromState, initialFilters.search]);

  useEffect(() => {
    if (data && !isLoading) {
      const hasUrlParams = searchParams.toString();

      if (hasUrlParams) {
        restoreScrollPosition();
      } else {
        import("@/services/utils/autoScroll").then(({ restoreScrollWithItemHighlight }) => {
          restoreScrollWithItemHighlight("jobseeker-selected-item", "jobseeker-scroll-position");
        });
      }
    }
  }, [data, isLoading, searchParams, restoreScrollPosition]);

  useEffect(() => {
    const isOnPageOneWithNoFilters =
      filters.page === 1 &&
      !filters.search &&
      !filters.city &&
      !filters.radius &&
      !filters.location &&
      !filters.occupationId &&
      !filters.status;

    if (isOnPageOneWithNoFilters) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("jobseeker-search-state");
        localStorage.removeItem("jobseeker-scroll-position");
      }
    } else if (
      filters.search ||
      filters.city ||
      filters.radius ||
      filters.location ||
      filters.occupationId ||
      filters.status ||
      (filters.page && filters.page > 1)
    ) {
      saveSearchState();
    }
  }, [filters, saveSearchState]);

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
    occupationsData,
    isOccupationsLoading,
    statesData,
    isStatesLoading,
    isViewingResume,

    tableColumns,
    statusOptions,
    occupationOptions,
    stateOptions,
    licenseOptions,
    licenseStateOptions,
    itemsPerPageOptions,

    filterChange,
    initPageChange,
    getStatusVariant,
    initViewResume,
    viewJobSeeker,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    saveScrollPosition,
    restoreScrollPosition,
    saveSearchState,
  };
};
