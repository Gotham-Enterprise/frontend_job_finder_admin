export interface GscStatusResponse {
  success: boolean;
  data: {
    enabled: boolean;
    properties: GscProperty[];
    toggle: { key: string; value: string };
    lastSyncs: GscSyncLogEntry[];
    cron: { running: boolean; schedule: string; timezone: string };
  };
}

export interface GscSettingResponse {
  success: boolean;
  data: { key: string; value: string };
}

export interface GscProperty {
  id: string;
  siteUrl: string;
  label: string | null;
  enabled: boolean;
  lastSyncedAt: string | null;
  _count?: { dailyData: number; sitemaps: number };
}

export interface GscSyncLogEntry {
  id: string;
  propertyId: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "success" | "failed";
  rowsFetched: number;
  error: string | null;
  property?: { siteUrl: string; label: string | null };
}

export interface GscAnalyticsSummary {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  dailyTrends: GscDailyTrend[];
  topQueries: GscQueryRow[];
  topPages: GscQueryRow[];
  byProperty: GscByProperty[];
  byDevice: GscByDimension[];
  byCountry: GscByDimension[];
}

export interface GscQueryRow {
  query?: string;
  page?: string;
  _sum: { clicks: number; impressions: number };
  _avg: { ctr: number; position: number };
}

export interface GscDailyTrend {
  date: string;
  _sum: { clicks: number; impressions: number };
  _avg: { ctr: number; position: number };
}

export interface GscByProperty {
  propertyId: string;
  _sum: { clicks: number; impressions: number };
  _avg: { ctr: number; position: number };
  property: { id: string; siteUrl: string; label: string | null } | null;
}

export interface GscByDimension {
  device?: string;
  country?: string;
  _sum: { clicks: number; impressions: number };
  _avg: { ctr: number; position: number };
}

export interface GscSitemap {
  id: string;
  propertyId: string;
  path: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isIndex: boolean;
  errors: number;
  warnings: number;
  submittedUrls: number;
  property?: { siteUrl: string; label: string | null };
}
