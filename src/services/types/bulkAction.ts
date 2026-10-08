/** Per-id outcome of a bulk admin action; one failing id doesn't stop the rest. */
export interface BulkActionResult<T = unknown> {
  succeeded: T[];
  failed: Array<{ id: string; message: string }>;
}

export interface BulkActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data: BulkActionResult<T>;
}
