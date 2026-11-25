import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./apiUtils";

/**
 * Where a topic's content came from. `null` on the row means hand-authored in
 * this admin; the list filter spells that as "manual" (the backend maps it to
 * `source IS NULL`).
 */
export type MedicalLibrarySource = "nami" | "medlineplus";
export type MedicalLibrarySourceFilter = MedicalLibrarySource | "manual";
export type MedicalLibraryStatus = "published" | "draft";

export const MEDICAL_LIBRARY_SOURCE_LABELS: Record<MedicalLibrarySourceFilter, string> = {
  medlineplus: "MedlinePlus",
  nami: "NAMI",
  manual: "Manual",
};

export const getSourceLabel = (source: string | null | undefined): string =>
  MEDICAL_LIBRARY_SOURCE_LABELS[(source || "manual") as MedicalLibrarySourceFilter] || source || "Manual";

export interface MedicalLibraryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: MedicalLibraryStatus | "";
  source?: MedicalLibrarySourceFilter | "";
  sortBy?: string;
  sortOrder?: string;
}

export interface MedicalLibrarySection {
  id: string;
  label: string;
  html: string;
}

export interface MedicalLibraryTab {
  tabName: string;
  sections: MedicalLibrarySection[];
}

/** ICD-10-CM reference code attached by the MedlinePlus import (NLM Clinical Tables). */
export interface MedicalLibraryCode {
  system: string;
  code: string;
  name: string;
  /** true = the condition itself; false = another condition MedlinePlus files on the same page */
  primary: boolean;
}

export interface Icd10SearchHit {
  code: string;
  /** Official ICD-10-CM name */
  name: string;
  /** Lay condition names from the NLM conditions list filed under this code, if any */
  layNames: string[];
}

export interface MedicalLibraryContent {
  tabs: MedicalLibraryTab[];
  /** Imported topics only: the source's related topics by URL (resolved separately as relatedTopics). */
  related?: { title: string; sourceUrl: string }[];
  codes?: MedicalLibraryCode[];
  /** true once an admin edited the codes of an imported topic; the importer then leaves codes alone. */
  codesCurated?: boolean;
  /** The importer's own suggestion, kept while codes are curated so they can be reset. */
  codesFromImport?: MedicalLibraryCode[];
}

/** Snapshot of a topic's fields as they were immediately before a re-import overwrote them with a genuine change — lets the edit form show old vs new. Null/absent when there's nothing pending review. */
export interface MedicalLibraryPreviousVersion {
  title: string;
  category: string;
  description: string | null;
  content: MedicalLibraryContent;
}

/** One of the source's curated cross-references, with how it stands on our side. Single-topic endpoint only. */
export interface MedicalLibraryRelatedTopic {
  title: string;
  sourceUrl: string;
  /** Our row, when the related topic was imported; null when it was not. */
  id: string | null;
  slug: string | null;
  /** "published" | "draft" | null (not imported) */
  status: string | null;
}

export interface MedicalLibraryTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  description?: string;
  status?: string;
  content?: MedicalLibraryContent;
  /** Imported topics: the source's related topics resolved against our rows (adminGetTopicById only). */
  relatedTopics?: MedicalLibraryRelatedTopic[];
  /** Import that owns this row ("nami", "medlineplus"); null for hand-authored topics. */
  source?: MedicalLibrarySource | string | null;
  /** Canonical page on the source site; the importer's dedupe key. Single-topic endpoint only. */
  sourceUrl?: string | null;
  previousVersion?: MedicalLibraryPreviousVersion | null;
  /** List view only (adminGetTopics) — true when a re-import found changes and this topic has a pending diff to review. The full previousVersion snapshot only comes from the single-topic endpoint (adminGetTopicById). */
  hasPendingChanges?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalLibraryTopicsResponse {
  success: boolean;
  data: MedicalLibraryTopic[];
  metaData: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MedicalLibraryCreateData {
  title: string;
  slug: string;
  category: string;
  description?: string;
  status?: string;
  content?: MedicalLibraryContent;
}

/**
 * Bulk status change. Either `ids` or a non-empty `filter` is required; the
 * backend refuses an empty selection so a stray call can never flip the whole
 * table. The filter keys mirror the list filters, so "publish everything the
 * admin is currently looking at" is the same object the list was fetched with.
 */
export interface MedicalLibraryBulkStatusRequest {
  status: MedicalLibraryStatus;
  ids?: string[];
  filter?: Pick<MedicalLibraryFilters, "source" | "status" | "category" | "search">;
}

export interface MedicalLibraryBulkStatusResponse {
  success: boolean;
  data: { count: number; status: MedicalLibraryStatus };
}

export const medicalLibraryApi = {
  async getTopics(filters: MedicalLibraryFilters = {}): Promise<MedicalLibraryTopicsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.source) queryParams.append("source", filters.source);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    return apiGet<MedicalLibraryTopicsResponse>(`/api/admin/medical-library?${queryParams.toString()}`);
  },

  async getTopicById(id: string): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiGet(`/api/admin/medical-library/${id}`);
  },

  async createTopic(data: MedicalLibraryCreateData): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiPost(`/api/admin/medical-library`, data);
  },

  async updateTopic(
    id: string,
    data: Partial<MedicalLibraryCreateData>
  ): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiPut(`/api/admin/medical-library/${id}`, data);
  },

  async deleteTopic(id: string): Promise<{ success: boolean; message: string }> {
    return apiDelete(`/api/admin/medical-library/${id}`);
  },

  /** Search the full ICD-10-CM list by code prefix or name (NLM), with lay condition names where known. */
  async searchIcd10Codes(q: string): Promise<{ success: boolean; data: Icd10SearchHit[] }> {
    return apiGet(`/api/admin/medical-library/icd10-search?q=${encodeURIComponent(q)}`);
  },

  /** ICD-10-CM suggestions for a title (hand-maintained aliases, then NLM Clinical Tables). */
  async suggestCodes(title: string): Promise<{ success: boolean; data: { codes: MedicalLibraryCode[]; source: string } }> {
    return apiGet(`/api/admin/medical-library/suggest-codes?title=${encodeURIComponent(title)}`);
  },

  async bulkUpdateStatus(request: MedicalLibraryBulkStatusRequest): Promise<MedicalLibraryBulkStatusResponse> {
    // Drop empty filter values so the backend sees only real constraints.
    const filter = request.filter
      ? Object.fromEntries(Object.entries(request.filter).filter(([, value]) => value !== undefined && value !== ""))
      : undefined;
    return apiPatch(`/api/admin/medical-library/bulk-status`, {
      status: request.status,
      ...(request.ids?.length ? { ids: request.ids } : {}),
      ...(filter && Object.keys(filter).length ? { filter } : {}),
    });
  },
};
