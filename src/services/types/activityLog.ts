// ─────────────────────────────────────────────────────────────────────────────
// Activity Log types — used in admin Job Seeker & Employer detail pages
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityLogAdminReference {
  id: string;
  name: string;
  email: string | null;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  role: string;

  /** Raw action code e.g. "POST:/api/applications" or "LOGIN" */
  action: string;

  /** Human-readable English description e.g. "Submitted an application" */
  label: string;

  resourceType: string | null;
  resourceId: string | null;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;

  /** Display name of the user who performed the action */
  actorName: string;
  actorEmail: string | null;

  /**
   * Set when the action was taken during an admin impersonation session.
   * Contains the impersonating admin's id and name.
   */
  impersonatedByAdmin: ActivityLogAdminReference | null;

  /** True for IMPERSONATION_START / IMPERSONATION_END rows */
  isImpersonationEvent: boolean;

  /**
   * Set on IMPERSONATION_START / IMPERSONATION_END rows.
   * The user the admin was impersonating.
   */
  targetUser: ActivityLogAdminReference | null;

  details: Record<string, unknown> | null;
}

export interface ActivityLogPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ActivityLogsData {
  logs: ActivityLogEntry[];
  pagination: ActivityLogPagination;
}

export interface ActivityLogsResponse {
  success: boolean;
  data: ActivityLogsData;
}

export interface ActivityLogsFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
