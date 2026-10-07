// ─── Enums ───────────────────────────────────────────────────────────────────

export enum IngestSource {
  UPLOAD = "UPLOAD",
  PASTE = "PASTE",
  API = "API",
}

export enum IngestBatchStatus {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export const MAX_INGEST_ROWS = 5000;

// ─── Core Types ──────────────────────────────────────────────────────────────

/**
 * Raw scraped fields, preserved exactly as the source supplied them. These are
 * never rewritten by derivation, so an admin can always see what the scraper
 * actually produced.
 */
export interface IngestRawFields {
  url: string;
  address1: string | null;
  address2: string | null;
  imageUrl: string | null;
  spaceAvailable: string | null;
  details: string | null;
  description: string | null;
  contact: string | null;
}

/** A loose input row as uploaded or pasted — keys may use snake_case aliases. */
export interface IngestInputRow {
  url?: string;
  address1?: string;
  address2?: string;
  imageUrl?: string;
  spaceAvailable?: string;
  details?: string;
  description?: string;
  contact?: string;
  [snakeOrOtherKey: string]: unknown;
}

export interface IngestDerivedFields {
  squareFeet: number | null;
  priceText: string | null;
  yearBuilt: number | null;
  propertyTypeHint: string | null;
}

export interface IngestLandlordRef {
  id: string;
  businessName: string;
}

export interface IngestRecord extends IngestRawFields, IngestDerivedFields {
  id: string;
  landlordId: string | null;
  landlord?: IngestLandlordRef | null;
  importBatchId: string;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
}

export interface IngestBatch {
  id: string;
  source: IngestSource;
  fileName: string | null;
  status: IngestBatchStatus;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: IngestRowError[];
  createdAt: string;
}

/** A single rejected row. `row` is 1-based, matching the source file. */
export interface IngestRowError {
  row: number;
  url?: string;
  field?: string;
  message: string;
}

export interface IngestImportResult {
  dryRun: boolean;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: IngestRowError[];
  batchId?: string;
}

export interface IngestLandlordOption {
  id: string;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
}

// ─── Request Types ───────────────────────────────────────────────────────────

export interface IngestRecordFilters {
  page?: number;
  limit?: number;
  search?: string;
  landlordId?: string;
  unassigned?: boolean;
  propertyTypeHint?: string;
  sortBy?: "lastSeenAt" | "createdAt" | "squareFeet" | "yearBuilt" | "url";
  sortOrder?: "asc" | "desc";
}

export type IngestEditableFields = Partial<
  Omit<IngestRawFields, "url"> & IngestDerivedFields
>;

// ─── API Response Types ──────────────────────────────────────────────────────

interface PaginationMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IngestRecordsResponse {
  success: boolean;
  data: IngestRecord[];
  metaData: PaginationMetaData;
  message?: string;
}

export interface IngestRecordDetailResponse {
  success: boolean;
  data: IngestRecord;
  message?: string;
}

export interface IngestImportResponse {
  success: boolean;
  data: IngestImportResult;
  message?: string;
}

export interface IngestBatchesResponse {
  success: boolean;
  data: IngestBatch[];
  metaData: PaginationMetaData;
  message?: string;
}

export interface IngestBatchDetailResponse {
  success: boolean;
  data: IngestBatch;
  message?: string;
}

export interface IngestLandlordsResponse {
  success: boolean;
  data: IngestLandlordOption[];
  message?: string;
}

export interface IngestAssignResponse {
  success: boolean;
  data: { updated: number };
  message?: string;
}

export interface IngestDeleteResponse {
  success: boolean;
  data: { id: string };
  message?: string;
}

export interface IngestClearResponse {
  success: boolean;
  data: { deletedRecords: number; deletedListings: number; deletedBatches: number };
  message?: string;
}