export interface JobSearchStatistics {
  overview: {
    totalSearches: number;
    searchesInTimeWindow: number;
    avgResultsPerSearch: number;
    avgSearchTime: number;
  };
  topKeywords: Array<{
    keyword: string;
    count: number;
  }>;
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  topStates: Array<{
    state: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
  userTypeBreakdown: {
    authenticated: number;
    guest: number;
    total: number;
  };
  timeWindow: {
    hours: number;
    from: Date;
    to: Date;
  };
}

export interface KeywordTrend {
  keyword: string;
  timeline: Array<{
    timestamp: number;
    count: number;
  }>;
  totalCount: number;
}

export interface FilterUsage {
  filterName: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface LocationAnalytics {
  topStates: Array<{
    state: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
  ipAddresses: Array<{
    ipAddress: string;
    searchCount: number;
    lastSearched: Date;
  }>;
}

export interface SearchTrend {
  date: Date;
  searchCount: number;
  uniqueSessions: number;
  authenticatedUsers: number;
  avgResults: number;
}

export interface RecentSearch {
  id: string;
  keyword: string | null;
  location: string | null;
  locationCity: string | null;
  locationState: string | null;
  resultsCount: number;
  searchTimeMs: number | null;
  searchedAt: Date;
  userId: string | null;
  ipAddress: string | null;
  filters: any;
}
