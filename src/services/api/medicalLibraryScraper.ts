import { apiGet, apiPost } from "./apiUtils";

export type ScraperRunTriggerSource = "manual" | "scheduled";
export type ScraperRunStatus = "pending" | "running" | "completed" | "failed";

/**
 * Imports an admin can trigger. "nami" queues a run for the external NAMI
 * scraper's poll loop; "medlineplus" starts the backend's in-process
 * MedlinePlus importer and returns 202 with the run row.
 */
export type ImportSource = "nami" | "medlineplus";

export const IMPORT_SOURCES: { value: ImportSource; label: string; schedule: string; description: string }[] = [
  {
    value: "nami",
    label: "NAMI",
    schedule: "Fridays at midnight",
    description: "Mental Health Disorders scraped from nami.org by the external scraper.",
  },
  {
    value: "medlineplus",
    label: "MedlinePlus",
    schedule: "Saturdays at 3:00 AM",
    description: "Medical Conditions imported from the MedlinePlus (NIH) health topics XML.",
  },
];

export const getImportSourceLabel = (source: string): string =>
  IMPORT_SOURCES.find((s) => s.value === source)?.label || source;

export interface ScraperRunUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ScraperRun {
  id: string;
  source: ImportSource | string;
  triggerSource: ScraperRunTriggerSource;
  status: ScraperRunStatus;
  triggeredByUser: ScraperRunUser | null;
  totalTopics: number | null;
  processedTopics: number;
  createdCount: number;
  updatedCount: number;
  failedCount: number;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export const triggerScraperRun = async (source: ImportSource = "nami"): Promise<ScraperRun> => {
  const response = await apiPost<{ success: boolean; data: ScraperRun }>(
    "/api/admin/medical-library/scraper-runs",
    { source }
  );
  return response.data;
};

export const getScraperRuns = async (params?: {
  page?: number;
  limit?: number;
  source?: ImportSource;
}): Promise<{ data: ScraperRun[]; metaData: { totalCount: number; page: number; limit: number; totalPages: number } }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.source) queryParams.append("source", params.source);
  const queryString = queryParams.toString();
  return apiGet(`/api/admin/medical-library/scraper-runs${queryString ? `?${queryString}` : ""}`);
};

export const getScraperRun = async (id: string): Promise<ScraperRun> => {
  const response = await apiGet<{ success: boolean; data: ScraperRun }>(
    `/api/admin/medical-library/scraper-runs/${id}`
  );
  return response.data;
};

/**
 * Mirrors the exact check adminTriggerScraperRun's own 409 guard uses, so the
 * trigger button's disabled state can never disagree with what a click would
 * actually do. Deliberately not inferred from the run-history list's newest
 * row on the frontend: a bare CLI/scheduled run bypasses the guard entirely
 * and can start and finish *after* an earlier run gets stuck, which can rank
 * a finished run above a still-stuck one in a startedAt-sorted list.
 *
 * Scoped per source: a NAMI scrape and a MedlinePlus import may overlap.
 */
export const getActiveScraperRun = async (source: ImportSource = "nami"): Promise<ScraperRun | null> => {
  const response = await apiGet<{ success: boolean; data: ScraperRun | null }>(
    `/api/admin/medical-library/scraper-runs/active?source=${source}`
  );
  return response.data;
};
