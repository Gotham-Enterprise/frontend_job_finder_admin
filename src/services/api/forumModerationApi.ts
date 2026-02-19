import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from "./apiUtils";

// Type definitions for forum moderation
export interface ReportItem {
  id: string;
  reporterId: string | null;
  targetType: "question" | "answer";
  targetId: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
  isAiGenerated?: boolean;
  aiConfidenceScore?: number;
  reporter: {
    id: string;
    displayName: string;
    user: {
      username: string;
    };
  } | null;
  question?: {
    id: string;
    title: string;
    slug: string;
    content: string;
  };
  answer?: {
    id: string;
    content: string;
    question: {
      title: string;
      slug: string;
    };
  };
  resolvedAt?: string;
  resolvedBy?: string;
  resolver?: {
    id: string;
    displayName: string;
  };
}

export interface FlaggedContent {
  id: string;
  title?: string;
  content: string;
  type: "question" | "answer";
  moderationStatus: "pending" | "approved" | "rejected";
  flagCount: number;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    user: {
      username: string;
    };
  };
  question?: {
    title: string;
    slug: string;
  };
}

export interface BlockedUser {
  id: string;
  displayName: string;
  reputation: number;
  isBlocked: boolean;
  blockedAt?: string;
  blockReason?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  blockedByAdmin?: {
    id: string;
    username: string;
  };
}

export interface ModerationLog {
  id: string;
  adminId: string;
  action: string;
  targetType: "question" | "answer" | "user" | "report";
  targetId: string;
  reason?: string;
  metadata?: any;
  createdAt: string;
  admin: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ForumContentItem {
  id: string;
  type: "question" | "answer";
  title?: string; // Only for questions
  slug?: string; // Only for questions
  content: string;
  viewCount: number | null; // null for answers
  upvotes: number;
  downvotes: number;
  moderationStatus: "pending" | "approved" | "rejected";
  status?: "open" | "closed" | "deleted"; // Only for questions
  isAccepted?: boolean; // Only for answers
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    reputation: number;
    user: {
      username: string;
    };
  };
  topic?: {
    name: string;
    slug: string;
  }; // Only for questions
  question?: {
    id: string;
    title: string;
    slug: string;
  }; // Only for answers
}

export interface ModerationStats {
  pendingReports: number;
  resolvedReports: number;
  flaggedContent: number;
  blockedUsers: number;
  totalReports: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API Functions

/**
 * Get moderation statistics for the dashboard
 */
export async function getModerationStats(token: string): Promise<ModerationStats> {
  const response = await apiGet<{ success: boolean; stats: ModerationStats }>("/api/admin/forum/stats");
  return response.stats;
}

/**
 * Get all reports with optional filters
 */
export async function getReports(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "resolved" | "dismissed";
    targetType?: "question" | "answer";
  }
): Promise<{ reports: ReportItem[]; pagination: PaginationMeta }> {
  const queryString = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const response = await apiGet<{ success: boolean; reports: ReportItem[]; pagination: PaginationMeta }>(
    `/api/admin/forum/reports${queryString}`
  );
  return { reports: response.reports, pagination: response.pagination };
}

/**
 * Resolve a report
 */
export async function resolveReport(
  token: string,
  reportId: string,
  data: { status: "reviewed" | "dismissed"; note?: string }
): Promise<ReportItem> {
  const response = await apiPut<{ success: boolean; report: ReportItem }>(
    `/api/admin/forum/reports/${reportId}/resolve`,
    data
  );
  return response.report;
}

/**
 * Get flagged content (high report count or rejected by mods)
 */
export async function getFlaggedContent(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    type?: "question" | "answer";
    moderationStatus?: "pending" | "approved" | "rejected";
  }
): Promise<{ content: FlaggedContent[]; pagination: PaginationMeta }> {
  const queryString = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const response = await apiGet<{ success: boolean; content: FlaggedContent[]; pagination: PaginationMeta }>(
    `/api/admin/forum/flagged-content${queryString}`
  );
  return { content: response.content, pagination: response.pagination };
}

/**
 * Moderate content (approve or reject)
 */
export async function moderateContent(
  token: string,
  contentType: "question" | "answer",
  contentId: string,
  data: { action: "approve" | "reject"; reason?: string }
): Promise<{ question?: any; answer?: any }> {
  const response = await apiPut<{ success: boolean; question?: any; answer?: any }>(
    `/api/admin/forum/content/${contentType}/${contentId}/moderate`,
    data
  );
  return { question: response.question, answer: response.answer };
}

/**
 * Soft delete content (sets deletedAt and deletedBy)
 */
export async function deleteContent(
  token: string,
  contentType: "question" | "answer",
  contentId: string,
  reason?: string
): Promise<void> {
  const response = await apiRequest<{ success: boolean; content: any }>(
    `/api/admin/forum/content/${contentType}/${contentId}`,
    {
      method: "DELETE",
      body: { reason: reason || "No reason provided" },
    }
  );
}

/**
 * Restore soft-deleted content
 */
export async function restoreContent(
  token: string,
  contentType: "question" | "answer",
  contentId: string
): Promise<FlaggedContent> {
  const response = await apiPut<{ success: boolean; content: FlaggedContent }>(
    `/api/admin/forum/content/${contentType}/${contentId}/restore`
  );
  return response.content;
}

/**
 * Get deleted content
 */
export async function getDeletedContent(
  token: string,
  params?: {
    type?: "all" | "question" | "answer";
    page?: number;
    limit?: number;
  }
): Promise<{ content: FlaggedContent[]; pagination: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await apiGet<{
    success: boolean;
    content: FlaggedContent[];
    pagination: PaginationMeta;
  }>(`/api/admin/forum/deleted-content?${queryParams.toString()}`);

  return {
    content: response.content,
    pagination: response.pagination,
  };
}

/**
 * Get all blocked users
 */
export async function getBlockedUsers(
  token: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<{ users: BlockedUser[]; pagination: PaginationMeta }> {
  const queryString = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const response = await apiGet<{ success: boolean; users: BlockedUser[]; pagination: PaginationMeta }>(
    `/api/admin/forum/blocked-users${queryString}`
  );
  return { users: response.users, pagination: response.pagination };
}

/**
 * Get all forum users with optional search
 */
export async function getAllForumUsers(
  token: string,
  params?: {
    search?: string;
    blocked?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ users: BlockedUser[]; pagination: PaginationMeta }> {
  // Filter out empty/undefined parameters
  const cleanParams: any = {};
  if (params?.page) cleanParams.page = params.page;
  if (params?.limit) cleanParams.limit = params.limit;
  if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params?.blocked) cleanParams.blocked = params.blocked;

  const queryString = Object.keys(cleanParams).length > 0 ? "?" + new URLSearchParams(cleanParams).toString() : "";
  const response = await apiGet<{ success: boolean; users: BlockedUser[]; pagination: PaginationMeta }>(
    `/api/admin/forum/users${queryString}`
  );
  return { users: response.users, pagination: response.pagination };
}

/**
 * Block a forum user
 */
export async function blockUser(token: string, userId: string, data: { reason: string }): Promise<BlockedUser> {
  const response = await apiPut<{ success: boolean; user: BlockedUser }>(`/api/admin/forum/users/${userId}/block`, {
    blockReason: data.reason,
  });
  return response.user;
}

/**
 * Unblock a forum user
 */
export async function unblockUser(token: string, userId: string): Promise<BlockedUser> {
  const response = await apiPut<{ success: boolean; user: BlockedUser }>(
    `/api/admin/forum/users/${userId}/unblock`,
    {}
  );
  return response.user;
}

/**
 * Get moderation logs (audit trail)
 */
export async function getModerationLogs(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    action?: string;
    targetType?: "question" | "answer" | "user" | "report";
  }
): Promise<{ logs: ModerationLog[]; pagination: PaginationMeta }> {
  const queryString = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const response = await apiGet<{ success: boolean; logs: ModerationLog[]; pagination: PaginationMeta }>(
    `/api/admin/forum/moderation-logs${queryString}`
  );
  return { logs: response.logs, pagination: response.pagination };
}

/**
 * Bulk moderate multiple reports or content items
 */
export async function bulkModerate(
  token: string,
  data: {
    items: Array<{
      type: "report" | "question" | "answer";
      id: string;
      action: "resolve" | "dismiss" | "approve" | "reject" | "delete";
    }>;
    reason?: string;
  }
): Promise<{ processed: number; failed: number; results: any[] }> {
  const response = await apiPost<{ success: boolean; processed: number; failed: number; results: any[] }>(
    `/api/admin/forum/bulk-moderate`,
    data
  );
  return { processed: response.processed, failed: response.failed, results: response.results };
}

/**
 * Get forum content (questions or answers) with pagination and filters
 */
export async function getForumContent(
  token: string,
  params?: {
    type?: "question" | "answer";
    search?: string;
    sortBy?: "recent" | "upvotes" | "views";
    page?: number;
    limit?: number;
  }
): Promise<{ content: ForumContentItem[]; pagination: PaginationMeta }> {
  const cleanParams: any = {};
  if (params?.type) cleanParams.type = params.type;
  if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params?.sortBy) cleanParams.sortBy = params.sortBy;
  if (params?.page) cleanParams.page = params.page;
  if (params?.limit) cleanParams.limit = params.limit;

  const queryString = Object.keys(cleanParams).length > 0 ? "?" + new URLSearchParams(cleanParams).toString() : "";
  const response = await apiGet<{ success: boolean; content: ForumContentItem[]; pagination: PaginationMeta }>(
    `/api/admin/forum/content${queryString}`
  );
  return { content: response.content, pagination: response.pagination };
}

