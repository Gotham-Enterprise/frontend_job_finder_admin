import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  triggerScraperRun,
  getScraperRuns,
  getScraperRun,
  getActiveScraperRun,
  getImportSourceLabel,
  ImportSource,
  ScraperRun,
} from "../api/medicalLibraryScraper";
import { showToast } from "../utils/toast";

const medicalLibraryScraperQueryKeys = {
  all: ["medical-library-scraper"] as const,
  runs: () => [...medicalLibraryScraperQueryKeys.all, "runs"] as const,
  run: (id: string) => [...medicalLibraryScraperQueryKeys.all, "run", id] as const,
  active: (source: ImportSource) => [...medicalLibraryScraperQueryKeys.all, "active", source] as const,
};

const isActive = (status: ScraperRun["status"]) => status === "pending" || status === "running";

export const useTriggerScraperRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (source: ImportSource) => triggerScraperRun(source),
    onSuccess: (_, source) => {
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.runs() });
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.active(source) });
      if (source === "medlineplus") {
        showToast.success("MedlinePlus Import Started", "Progress shows in the runs table; new topics land as drafts.");
      } else {
        showToast.success("Re-scrape Triggered!", "The scraper will pick this up within ~30 seconds.");
      }
    },
    onError: (error: any, source) => {
      const errorMessage =
        error.response?.data?.message || error.message || `Failed to start the ${getImportSourceLabel(source)} run`;
      showToast.error("Trigger Failed", errorMessage);
      // A 409 means the backend's own view of "is a run active" just
      // changed (or was confirmed) — refresh immediately rather than
      // waiting for this poll's own interval, so the button's disabled
      // state and message line up with the toast the admin just saw.
      queryClient.invalidateQueries({ queryKey: medicalLibraryScraperQueryKeys.active(source) });
    },
  });
};

/** See getActiveScraperRun — the single source of truth for a trigger button's disabled state. */
export const useActiveScraperRun = (source: ImportSource = "nami") => {
  return useQuery({
    queryKey: medicalLibraryScraperQueryKeys.active(source),
    queryFn: () => getActiveScraperRun(source),
    refetchInterval: (query) => (query.state.data ? 3000 : 30000),
  });
};

export const useScraperRuns = (params?: { page?: number; limit?: number; source?: ImportSource }) => {
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
