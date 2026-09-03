import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerScraperRun, getScraperRuns, getScraperRun, ScraperRun } from "../api/medicalLibraryScraper";
import { showToast } from "../utils/toast";

const medicalLibraryScraperQueryKeys = {
  all: ["medical-library-scraper"] as const,
  runs: () => [...medicalLibraryScraperQueryKeys.all, "runs"] as const,
  run: (id: string) => [...medicalLibraryScraperQueryKeys.all, "run", id] as const,
};

const isActive = (status: ScraperRun["status"]) => status === "pending" || status === "running";

export const useTriggerScraperRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerScraperRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.runs() });
      showToast.success("Re-scrape Triggered!", "The scraper will pick this up within ~30 seconds.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to trigger re-scrape";
      showToast.error("Trigger Failed", errorMessage);
    },
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
