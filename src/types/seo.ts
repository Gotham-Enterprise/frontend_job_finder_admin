export interface CrawlFunnelStage {
  label: string;
  count: number;
  pctOfPrevious: number;
  trend: number | null;
}

export interface CrawledByType {
  pageType: string;
  count: number;
  prevCount: number;
  pctOfTotal: number;
}

export interface CrawlFunnelResponse {
  success: boolean;
  data: {
    stages: CrawlFunnelStage[];
    crawledByType: CrawledByType[];
    periodDays: number;
  };
}
