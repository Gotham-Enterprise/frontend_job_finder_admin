/** Admin Engagement Analytics — GET /api/supervision/admin/{supervisors|supervisees}/:id/engagement and related endpoints. */

export type EngagementRole = "SUPERVISOR" | "SUPERVISEE";

export type EngagementHireKind = "SUPERVISION" | "MEDICAL_DIRECTOR";

export interface EngagementCounterpart {
  id: string;
  name: string | null;
  email: string;
  role: EngagementRole | "ADMIN";
  /** "Supervisee", "Supervisor" or "Medical Director". */
  roleLabel: string | null;
  profilePhotoUrl: string | null;
  isDeleted: boolean;
}

export interface EngagementMessageSummary {
  sent: number;
  received: number;
  total: number;
  conversations: number;
  /** Conversations with at least one counted (non-system) message. */
  activeConversations: number;
  firstMessageAt: string | null;
  lastMessageAt: string | null;
}

export interface EngagementConversation {
  id: string;
  status: string;
  createdAt: string;
  counterpart: EngagementCounterpart | null;
  messagesSent: number;
  messagesReceived: number;
  totalMessages: number;
  firstMessageAt: string | null;
  lastMessageAt: string | null;
  hire: { id: string; status: string; kind: EngagementHireKind } | null;
}

export interface EngagementHire {
  id: string;
  kind: EngagementHireKind;
  status: string;
  counterpart: EngagementCounterpart | null;
  createdAt: string;
  acceptedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  completedAt: string | null;
  canceledAt: string | null;
  rejectedAt: string | null;
}

export interface EngagementConnectionRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "CANCELED" | string;
  source: "REGISTERED_USER" | "PUBLIC" | string;
  createdAt: string;
  approvedAt: string | null;
  declinedAt: string | null;
  /** The account on the other side; null for a public visitor without one. */
  counterpart: EngagementCounterpart | null;
  /** Name/email a public visitor typed in; null when `counterpart` is set. */
  guest: { name: string; email: string } | null;
}

export interface SupervisionEngagement {
  userId: string;
  role: EngagementRole;
  messages: EngagementMessageSummary;
  conversations: EngagementConversation[];
  hires: {
    total: number;
    /** ACCEPTED or ACTIVE. */
    current: number;
    byStatus: Record<string, number>;
    items: EngagementHire[];
  };
  connectionRequests: {
    /** Supervisees send requests; supervisors receive them. */
    direction: "SENT" | "RECEIVED";
    total: number;
    byStatus: Record<string, number>;
    items: EngagementConnectionRequest[];
  };
}

export interface SupervisionEngagementResponse {
  success: boolean;
  data: SupervisionEngagement;
}

/** Per-row engagement counts on the admin Supervisor / Supervisee list tables. */
export interface EngagementListMetrics {
  messagesSent: number;
  messagesReceived: number;
  totalMessages: number;
  /** ACCEPTED or ACTIVE. */
  currentHires: number;
  totalHires: number;
}

/** Admin list `sortBy` values backed by EngagementListMetrics. */
export type EngagementSortBy = "totalMessages" | "currentHires";

export interface ConversationTimelineMessage {
  id: string;
  sentAt: string;
  messageType: "TEXT" | "FILE" | string;
  deliveredAt: string | null;
  readAt: string | null;
  isRead: boolean;
  sender: { id: string; name: string | null; roleLabel: string | null };
}

export interface ConversationTimeline {
  conversation: {
    id: string;
    status: string;
    createdAt: string;
    supervisee: EngagementCounterpart | null;
    supervisor: EngagementCounterpart | null;
    hire: { id: string; status: string; kind: EngagementHireKind } | null;
  };
  messages: ConversationTimelineMessage[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ConversationTimelineResponse {
  success: boolean;
  data: ConversationTimeline;
}

/** Dashboard periods accepted by GET /api/supervision/admin/engagement/overview. */
export type EngagementOverviewPeriod = "7d" | "28d" | "3m" | "6m" | "1y";

export interface EngagementOverviewTrendBucket {
  /** Bucket start in the admin's timezone, YYYY-MM-DD. */
  date: string;
  /** "Nov 5" for daily buckets, "Week of Nov 3" for weekly ones. */
  label: string;
  messages: number;
  hireRequests: number;
  hiresAccepted: number;
}

export interface EngagementOverviewKindRow {
  kind: EngagementHireKind;
  currentHires: number;
  hireRequests: number;
  hiresAccepted: number;
}

export interface EngagementNoHireConversation {
  conversationId: string;
  supervisee: EngagementCounterpart | null;
  supervisor: EngagementCounterpart | null;
  messagesInPeriod: number;
  lastMessageAt: string;
  /** Latest hire request between the two, if any (never accepted). */
  latestHireRequest: { status: string; createdAt: string } | null;
}

export interface EngagementOverview {
  period: EngagementOverviewPeriod;
  timezone: string;
  range: { start: string; end: string };
  granularity: "day" | "week";
  summary: {
    messages: number;
    activeConversations: number;
    convertedConversations: number;
    /** converted / active; null when nobody messaged in the period. */
    conversionRate: number | null;
    hireRequests: number;
    hiresAccepted: number;
    /** ACCEPTED or ACTIVE right now, regardless of period. */
    currentHires: number;
    connectionRequestsSent: number;
    connectionRequestsApproved: number;
  };
  byKind: EngagementOverviewKindRow[];
  trend: EngagementOverviewTrendBucket[];
  noHireConversations: { total: number; items: EngagementNoHireConversation[] };
}

export interface EngagementOverviewResponse {
  success: boolean;
  data: EngagementOverview;
}
