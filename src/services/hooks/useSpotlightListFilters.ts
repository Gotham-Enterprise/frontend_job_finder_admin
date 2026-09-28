import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ListFilters } from "../types/spotlight";

/**
 * Status/search/page filters for the spotlight list pages, mirrored into the URL
 * so a reload or a "Back to list" keeps the admin where they were.
 */
export const useSpotlightListFilters = (basePath: string, defaultStatus = "") => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ListFilters>(() => ({
    status: searchParams.get("status") ?? defaultStatus,
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  }));

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.limit && filters.limit !== 20) params.set("limit", String(filters.limit));

    const next = params.toString() ? `?${params.toString()}` : "";
    if (next !== window.location.search) router.replace(`${basePath}${next}`, { scroll: false });
  }, [filters, basePath, router]);

  const onFilterChange = useCallback((key: keyof ListFilters, value: string | number) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev;
      // Any filter other than paging sends the admin back to the first page.
      return key === "page" ? { ...prev, page: Number(value) } : { ...prev, [key]: value, page: 1 };
    });
  }, []);

  const onSearch = useCallback((value: string) => onFilterChange("search", value), [onFilterChange]);

  return { filters, onFilterChange, onSearch };
};
