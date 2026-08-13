"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { newsletterSubscriberApi } from "@/services/api/newsletterSubscriber";
import { showToast } from "@/services/utils/toast";
import type {
  NewsletterSubscriberFilters,
  NewsletterOverview,
} from "@/services/types/newsletterSubscriber";

const DEFAULT_LIMIT = 20;

export const newsletterSubscriberQueryKeys = {
  all: ["newsletterSubscribers"] as const,
  list: (filters: NewsletterSubscriberFilters) =>
    [...newsletterSubscriberQueryKeys.all, "list", filters] as const,
  overview: () => [...newsletterSubscriberQueryKeys.all, "overview"] as const,
  logs: (page: number) =>
    [...newsletterSubscriberQueryKeys.all, "logs", page] as const,
};

const parseFiltersFromUrl = (
  searchParams: URLSearchParams
): NewsletterSubscriberFilters => ({
  page: Number(searchParams.get("page")) || 1,
  limit: Number(searchParams.get("limit")) || DEFAULT_LIMIT,
  search: searchParams.get("search") || "",
  occupationId: searchParams.get("occupationId")
    ? Number(searchParams.get("occupationId"))
    : undefined,
  city: searchParams.get("city") || "",
  state: searchParams.get("state") || "",
  status:
    (searchParams.get("status") as "active" | "unsubscribed") || undefined,
});

export function useNewsletterSubscribersLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<NewsletterSubscriberFilters>(() =>
    parseFiltersFromUrl(searchParams)
  );
  const [logsPage, setLogsPage] = useState(1);

  const subscribersQuery = useQuery({
    queryKey: newsletterSubscriberQueryKeys.list(filters),
    queryFn: () => newsletterSubscriberApi.getSubscribers(filters),
  });

  const overviewQuery = useQuery({
    queryKey: newsletterSubscriberQueryKeys.overview(),
    queryFn: () => newsletterSubscriberApi.getOverview(),
  });

  const logsQuery = useQuery({
    queryKey: newsletterSubscriberQueryKeys.logs(logsPage),
    queryFn: () => newsletterSubscriberApi.getSendLogs(logsPage, DEFAULT_LIMIT),
  });

  const updateUrl = useCallback(
    (f: NewsletterSubscriberFilters) => {
      const params = new URLSearchParams();
      if (f.page && f.page > 1) params.set("page", f.page.toString());
      if (f.limit && f.limit !== DEFAULT_LIMIT)
        params.set("limit", f.limit.toString());
      if (f.search) params.set("search", f.search);
      if (f.occupationId) params.set("occupationId", f.occupationId.toString());
      if (f.city) params.set("city", f.city);
      if (f.state) params.set("state", f.state);
      if (f.status) params.set("status", f.status);
      const qs = params.toString();
      router.replace(`/admin/newsletters/job-seeker${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  const toggleMutation = useMutation({
    mutationFn: (isEnabled: boolean) =>
      newsletterSubscriberApi.updateCampaignEnabled(isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: newsletterSubscriberQueryKeys.overview(),
      });
    },
    onError: (error: any) => {
      showToast.error(
        "Update Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to update campaign setting."
      );
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (id: string) => newsletterSubscriberApi.unsubscribeSubscriber(id),
    onSuccess: (data) => {
      showToast.success("Unsubscribed", data.message || "Subscriber unsubscribed");
      queryClient.invalidateQueries({
        queryKey: newsletterSubscriberQueryKeys.all,
      });
    },
    onError: (error: any) => {
      showToast.error(
        "Unsubscribe Failed",
        error.response?.data?.message || error.message || "Failed to unsubscribe."
      );
    },
  });

  const filterChange = useCallback(
    (patch: Partial<NewsletterSubscriberFilters>) => {
      setFilters((prev) => {
        const next: NewsletterSubscriberFilters = {
          ...prev,
          ...patch,
          page: patch.page ?? 1,
        };
        updateUrl(next);
        return next;
      });
    },
    [updateUrl]
  );

  const pageChange = useCallback(
    (page: number) => {
      setFilters((prev) => {
        const next: NewsletterSubscriberFilters = { ...prev, page };
        updateUrl(next);
        return next;
      });
    },
    [updateUrl]
  );

  const clearFilters = useCallback(() => {
    const next: NewsletterSubscriberFilters = { page: 1, limit: DEFAULT_LIMIT };
    setFilters(next);
    updateUrl(next);
  }, [updateUrl]);

  const totalPages = useMemo(
    () => Math.ceil((subscribersQuery.data?.total ?? 0) / (filters.limit || DEFAULT_LIMIT)),
    [subscribersQuery.data?.total, filters.limit]
  );

  const logsTotalPages = useMemo(
    () => Math.ceil((logsQuery.data?.total ?? 0) / DEFAULT_LIMIT),
    [logsQuery.data?.total]
  );

  const overview: NewsletterOverview | null = overviewQuery.data ?? null;

  return {
    filters,
    setSearch: (search: string) => filterChange({ search }),
    setOccupationId: (v: number | undefined) => filterChange({ occupationId: v }),
    setCity: (v: string) => filterChange({ city: v }),
    setState: (v: string) => filterChange({ state: v }),
    setStatus: (v: "active" | "unsubscribed" | undefined) =>
      filterChange({ status: v }),
    clearFilters,
    pageChange,
    totalPages,
    data: subscribersQuery.data,
    isLoading: subscribersQuery.isLoading,
    error: subscribersQuery.error,
    unsubscribe: (id: string) => unsubscribeMutation.mutate(id),
    isUnsubscribing: unsubscribeMutation.isPending,
    overview,
    toggleEnabled: (isEnabled: boolean) => toggleMutation.mutate(isEnabled),
    isUpdatingToggle: toggleMutation.isPending,
    logs: logsQuery.data,
    logsPage,
    logsTotalPages,
    setLogsPage,
    logsIsLoading: logsQuery.isLoading,
  };
}
