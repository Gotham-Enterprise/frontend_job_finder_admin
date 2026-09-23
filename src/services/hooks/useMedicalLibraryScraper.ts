import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  triggerScraperRun,
  getScraperRuns,
  getScraperRun,
  getActiveScraperRun,
  ScraperRun,
} from "../api/medicalLibraryScraper";
import { showToast } from "../utils/toast";

const medicalLibraryScraperQueryKeys = {
  all: ["medical-library-scraper"] as const,
  runs: () => [...medicalLibraryScraperQueryKeys.all, "runs"] as const,
  run: (id: string) => [...medicalLibraryScraperQueryKeys.all, "run", id] as const,
  active: () => [...medicalLibraryScraperQueryKeys.all, "active"] as const,
};

const isActive = (status: ScraperRun["status"]) => status === "pending" || status === "running";

export const useTriggerScraperRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerScraperRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.runs() });
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.active() });
      showToast.success("Re-scrape Triggered!", "The scraper will pick this up within ~30 seconds.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to trigger re-scrape";
      showToast.error("Trigger Failed", errorMessage);
      // A 409 means the backend's own view of "is a run active" just
      // changed (or was confirmed) — refresh immediately rather than
      // waiting for this poll's own interval, so the button's disabled
      // state and message line up with the toast the admin just saw.
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.active() });
    },
  });
};

/** See getActiveScraperRun — the single source of truth for the trigger button's disabled state. */
export const useActiveScraperRun = () => {
  return useQuery({
    queryKey: medicalLibraryScraperQueryKeys.active(),
    queryFn: getActiveScraperRun,
    refetchInterval: (query) => (query.state.data ? 3000 : 30000),
  });
};

export const useScraperRuns = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...medicalLibraryScraperQueryKeys.runs(), params],
    queryFn: () => getScraperRuns(params),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.data?.some((run) => isActive(run.status));
      return hasActive ? 3000 : 30000;
    },
  });
};

export const useScraperRun = (id: string | undefined) => {
  return useQuery({
    queryKey: medicalLibraryScraperQueryKeys.run(id || ""),
    queryFn: () => getScraperRun(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && isActive(data.status) ? 3000 : false;
    },
  });
};
