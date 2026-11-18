import {
  IngestAssignResponse,
  IngestBatchDetailResponse,
  IngestBatchesResponse,
  IngestClearResponse,
  IngestDeleteResponse,
  IngestEditableFields,
  IngestImportResponse,
  IngestImportResult,
  IngestInputRow,
  IngestLandlordsResponse,
  IngestRecordDetailResponse,
  IngestRecordFilters,
  IngestRecordsResponse,
  IngestSource,
} from "../types/officeSpaceIngest";
import { apiDelete, apiGet, apiPost, apiPut } from "./apiUtils";

interface ImportOptions {
  rows: IngestInputRow[];
  source: IngestSource;
  fileName?: string;
  dryRun?: boolean;
}

interface ImportCsvOptions {
  csv: string;
  source: IngestSource;
  fileName?: string;
  dryRun?: boolean;
}

function importQuery(options: {
  source: IngestSource;
  fileName?: string;
  dryRun?: boolean;
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("source", options.source);
  if (options.fileName) queryParams.append("fileName", options.fileName);
  if (options.dryRun) queryParams.append("dryRun", "true");
  return queryParams;
}

export const officeSpaceIngestApi = {
  async getRecords(
    filters: IngestRecordFilters = {}
  ): Promise<IngestRecordsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.landlordId) queryParams.append("landlordId", filters.landlordId);
    if (filters.unassigned) queryParams.append("unassigned", "true");
    if (filters.propertyTypeHint)
      queryParams.append("propertyTypeHint", filters.propertyTypeHint);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    const query = queryParams.toString();
    return apiGet<IngestRecordsResponse>(
      `/api/admin/office-space-ingest/records${query ? `?${query}` : ""}`
    );
  },

  async getRecordById(id: string): Promise<IngestRecordDetailResponse> {
    return apiGet<IngestRecordDetailResponse>(
      `/api/admin/office-space-ingest/records/${id}`
    );
  },

  async updateRecord(
    id: string,
    data: IngestEditableFields
  ): Promise<IngestRecordDetailResponse> {
    return apiPut<IngestRecordDetailResponse>(
      `/api/admin/office-space-ingest/records/${id}`,
      data
    );
  },

  async deleteRecord(id: string): Promise<IngestDeleteResponse> {
    return apiDelete<IngestDeleteResponse>(
      `/api/admin/office-space-ingest/records/${id}`
    );
  },

  /**
   * Wipes all scraped data — ingest records, their converted listings, and
   * import batches. Manual listings and landlords are left alone. The backend
   * hard-requires ?confirm=true so this can never fire by accident.
   */
  async clearAll(): Promise<IngestClearResponse> {
    return apiDelete<IngestClearResponse>(
      "/api/admin/office-space-ingest/records?confirm=true"
    );
  },

  async assignLandlord(
    ids: string[],
    landlordId: string | null
  ): Promise<IngestAssignResponse> {
    return apiPost<IngestAssignResponse>(
      "/api/admin/office-space-ingest/records/bulk-landlord",
      { ids, landlordId }
    );
  },

  async getLandlords(): Promise<IngestLandlordsResponse> {
    return apiGet<IngestLandlordsResponse>(
      "/api/admin/office-space-ingest/landlords"
    );
  },

  /**
   * Rows go over the wire as JSON. Used when the admin pastes JSON.
   */
  async importRows(
    options: ImportOptions
  ): Promise<IngestImportResult> {
    const query = importQuery(options).toString();
    const response = await apiPost<IngestImportResponse>(
      `/api/admin/office-space-ingest/imports?${query}`,
      { rows: options.rows }
    );
    return response.data;
  },

  /**
   * Raw CSV is sent untouched as text/csv and parsed server-side. This keeps a
   * single CSV parser (and a single derivation implementation) in the
   * codebase, and means the dry-run preview reflects exactly what a real
   * import would store. The same path is what a future automated scraper
   * will use.
   */
  async importCsvText(
    options: ImportCsvOptions
  ): Promise<IngestImportResult> {
    const query = importQuery(options).toString();
    const response = await apiPost<IngestImportResponse>(
      `/api/admin/office-space-ingest/imports?${query}`,
      options.csv,
      { headers: { "Content-Type": "text/csv" } }
    );
    return response.data;
  },

  async getBatches(page: number = 1, limit: number = 20): Promise<IngestBatchesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    return apiGet<IngestBatchesResponse>(
      `/api/admin/office-space-ingest/imports?${queryParams.toString()}`
    );
  },

  async getBatchById(id: string): Promise<IngestBatchDetailResponse> {
    return apiGet<IngestBatchDetailResponse>(
      `/api/admin/office-space-ingest/imports/${id}`
    );
  },
};