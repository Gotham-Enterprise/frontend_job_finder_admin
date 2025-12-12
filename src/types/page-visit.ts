export interface PageVisitThreshold {
  id: string;
  pageUrl: string;
  expectedVisits: number;
  timeWindowHours: number;
  enabled: boolean;
  lastAlertSent: string | null;
  alertsSentCount: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  currentCount?: number;
  isExceeding?: boolean;
}

export interface PageVisitAlert {
  id: string;
  thresholdId: string;
  pageUrl: string;
  visitCount: number;
  expectedVisits: number;
  timeWindowHours: number;
  alertSentAt: string;
}

export interface PageVisitStatistics {
  pageUrl: string;
  count: number;
  trend: Array<{
    timestamp: number;
    count: number;
  }>;
  timeWindow: {
    startHour: number;
    endHour: number;
  };
}

export interface TopPage {
  pageUrl: string;
  count: number;
}

export interface SystemHealthMetrics {
  memory: {
    used_memory: number;
    used_memory_human: string;
    maxmemory: number;
    maxmemory_human: string;
    evicted_keys: number;
    health: {
      status: "OK" | "WARNING" | "CRITICAL" | "UNKNOWN";
      usagePercent: string;
      message?: string;
    };
  };
  tracking: {
    pagesTracked: number;
    totalEntries: number;
    estimatedBytes: number;
    estimatedMB: string;
  };
  circuit: {
    state: "CLOSED" | "OPEN" | "HALF_OPEN";
    failures: number;
    lastFailure: number | null;
  };
  oldestData: string | null;
  tracksToday: number;
  alertsToday?: number;
  activeAlerts?: number;
}

export interface MemoryRecommendation {
  action: string;
  description: string;
  impact: string;
  priority: "High" | "Medium" | "Low";
}

export interface PageVisitEmailRecipient {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
