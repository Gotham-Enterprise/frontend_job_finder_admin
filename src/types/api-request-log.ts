export interface ApiRequestLog {
  id: string;
  method: string;
  path: string;
  routeKey: string | null;
  statusCode: number;
  durationMs: number;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  responseMessage: string | null;
  requestedAt: string;
}

export interface ApiRequestOverview {
  totalRequests: number;
  avgDurationMs: number;
  count2xx: number;
  count4xx: number;
  count5xx: number;
  hours: number;
}

export interface StatusCodeBreakdown {
  statusCode: number;
  count: number;
}

export interface TopEndpoint {
  routeKey: string;
  method: string;
  count: number;
  statusBreakdown: StatusCodeBreakdown[];
}

export interface EndpointTrend {
  timestamp: string;
  count: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}
