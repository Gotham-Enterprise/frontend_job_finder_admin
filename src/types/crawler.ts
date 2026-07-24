export type CrawlerType =
  | "GOOGLEBOT"
  | "GOOGLE_INSPECTION_TOOL"
  | "GOOGLE_OTHER"
  | "ADSBOT"
  | "MEDIAPARTNERS"
  | "OTHER_KNOWN"
  | "FAKE_CLAIMED";

export type SeoPageType =
  | "JOB_DETAIL"
  | "JOB_SEARCH"
  | "OCCUPATION"
  | "STATE"
  | "CITY"
  | "SITEMAP"
  | "ROBOTS"
  | "HOME"
  | "BLOG"
  | "API"
  | "OTHER";

export interface BotCrawlerRequest {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  normalizedRoute: string | null;
  seoPageType: SeoPageType;
  jobId: string | null;
  occupation: string | null;
  state: string | null;
  city: string | null;
  httpStatus: number;
  redirectTarget: string | null;
  responseTimeMs: number;
  ttfbMs: number | null;
  cacheStatus: string | null;
  contentLength: number;
  structuredDataPresent: boolean;
  itemListPresent: boolean;
  jobPostingPresent: boolean;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  xRobotsTag: string | null;
  userAgent: string;
  verifiedClientIp: string | null;
  ipVerified: boolean;
  referrer: string | null;
  traceId: string | null;
  spanId: string | null;
  requestId: string | null;
  crawlerType: CrawlerType;
}

export interface CrawlerDashboardSummary {
  total: number;
  totalVerified: number;
  totalFake: number;
  avgLatency: number;
  p95Latency: number;
  maxLatency: number;
  slowRequestCount: number;
}

export interface CrawlerDashboardData {
  summary: CrawlerDashboardSummary;
  byCrawlerType: { type: CrawlerType; count: number }[];
  byStatus: { status: number; count: number }[];
  byPageType: { type: SeoPageType; count: number }[];
  topUrls: { url: string; count: number }[];
  topOccupations: { occupation: string; count: number }[];
  topStates: { state: string; count: number }[];
  topCities: { city: string; count: number }[];
  topJobIds: { jobId: string; count: number }[];
  top404s: { url: string; count: number }[];
  topExpired: { url: string; count: number }[];
}

export interface CrawlerAlert {
  severity: "critical" | "warning" | "info";
  metric: string;
  value: string;
  threshold: string;
  detail: string;
}

export interface CrawlerHealthPoint {
  hour: string;
  total: number;
  errors: number;
  not_found: number;
  redirects: number;
  avg_latency: number;
  p95_latency: number;
}
