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
  /** Whether this user sent the request or received it. */
  direction: "SENT" | "RECEIVED";
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
  /** Both directions; the automatic hire-accept connection is left out. */
  connectionRequests: {
    total: number;
    sent: number;
    received: number;
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

/** Dashboard filters; an empty value means "all". */
export interface EngagementOverviewFilters {
  /** A supervisor type name, matched against the supervisor's profile. */
  supervisorType: string;
  /** Two-letter code, matched against the supervisee's profile state. */
  superviseeState: string;
}

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

/** The summary measures that also have a previous-period value. */
export interface EngagementOverviewComparable {
  messages: number;
  activeConversations: number;
  convertedConversations: number;
  conversionRate: number | null;
  hireRequests: number;
  hiresAccepted: number;
  connectionRequestsSent: number;
  connectionRequestsApproved: number;
}

export interface EngagementResponsiveness {
  /** Supervisor reply time after a supervisee writes, in minutes. */
  medianReplyMinutes: number | null;
  replies: number;
  /** Supervisee messages from this period still unanswered after 24h. */
  unansweredOver24h: number;
  replyWithin24hRate: number | null;
  /** Connection requests supervisors received in this period. */
  connections: {
    medianAnswerMinutes: number | null;
    answered: number;
    unansweredOver24h: number;
    answeredWithin24hRate: number | null;
  };
}

export interface EngagementFollowUpRow {
  supervisor: EngagementCounterpart;
  pendingRequests: number;
  oldestPendingAt: string | null;
  /** Conversations whose last message is the supervisee's, unanswered. */
  waitingConversations: number;
  oldestWaitingAt: string | null;
}

export interface EngagementOverview {
  period: EngagementOverviewPeriod;
  timezone: string;
  filters: { supervisorType: string | null; superviseeState: string | null };
  filterOptions: { supervisorTypes: string[]; superviseeStates: string[] };
  range: { start: string; end: string };
  /** The equally long stretch right before `range`. */
  previousRange: { start: string; end: string };
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
    previous: EngagementOverviewComparable;
  };
  responsiveness: { current: EngagementResponsiveness; previous: EngagementResponsiveness };
  byKind: EngagementOverviewKindRow[];
  trend: EngagementOverviewTrendBucket[];
  noHireConversations: { total: number; items: EngagementNoHireConversation[] };
  /** Right now, not tied to the period. */
  needsFollowUp: { afterDays: number; total: number; items: EngagementFollowUpRow[] };
}

export interface EngagementOverviewResponse {
  success: boolean;
  data: EngagementOverview;
}
