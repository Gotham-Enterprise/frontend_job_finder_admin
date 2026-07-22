"use client";

import { useState } from "react";
import { useCrawlerDashboard, useCrawlerAlerts, useCrawlerHealth, useCrawlerRequests } from "@/services/hooks/useCrawler";
import type { CrawlerType, SeoPageType } from "@/types/crawler";

const PERIODS = [
  { value: "1h", label: "Last Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const CRAWLER_LABELS: Record<string, string> = {
  GOOGLEBOT: "Googlebot",
  GOOGLE_INSPECTION_TOOL: "Google Inspection Tool",
  GOOGLE_OTHER: "Google Other",
  ADSBOT: "AdsBot",
  MEDIAPARTNERS: "Mediapartners",
  OTHER_KNOWN: "Other Known",
  FAKE_CLAIMED: "Fake/Unverified",
};

const STATUS_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
};

function StatusBadge({ status, children }: { status: number; children: React.ReactNode }) {
  const color = status >= 500 ? "red" : status >= 400 ? "yellow" : status >= 300 ? "blue" : "green";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`}>
      {children}
    </span>
  );
}

export default function CrawlerDashboard() {
  const [period, setPeriod] = useState("24h");
  const [filterType, setFilterType] = useState<string>("");
  const [filterPageType, setFilterPageType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const dashboardParams = { period, crawlerType: filterType || undefined, seoPageType: filterPageType || undefined, httpStatus: filterStatus || undefined };
  const { data: dashData, isLoading: dashLoading } = useCrawlerDashboard(dashboardParams);
  const { data: alertsData } = useCrawlerAlerts({ period });
  const { data: healthData } = useCrawlerHealth({ period });
  const [requestUrl, setRequestUrl] = useState("");
  const { data: requestsData, isLoading: requestsLoading } = useCrawlerRequests({ ...dashboardParams, url: requestUrl || undefined, limit: "50" });

  const dash = dashData?.data;
  const alerts = alertsData?.data || [];

  if (dashLoading && !dash) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading crawler telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Crawlers</option>
          {Object.entries(CRAWLER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filterPageType} onChange={(e) => setFilterPageType(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Page Types</option>
          <option value="JOB_DETAIL">Job Detail</option>
          <option value="JOB_SEARCH">Job Search</option>
          <option value="OCCUPATION">Occupation</option>
          <option value="STATE">State</option>
          <option value="CITY">City</option>
          <option value="SITEMAP">Sitemap</option>
          <option value="HOME">Home</option>
          <option value="API">API</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`rounded-lg border px-4 py-3 text-sm ${STATUS_COLORS[a.severity]}`}>
              <span className="font-medium">{a.metric}:</span> {a.detail} (Value: {a.value}, Threshold: {a.threshold})
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {dash && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <SummaryCard label="Total Requests" value={dash.summary.total.toLocaleString()} />
          <SummaryCard label="Verified Google" value={dash.summary.totalVerified.toLocaleString()} variant="green" />
          <SummaryCard label="Fake/Unverified" value={dash.summary.totalFake.toLocaleString()} variant="red" />
          <SummaryCard label="Avg Latency" value={`${dash.summary.avgLatency}ms`} />
          <SummaryCard label="P95 Latency" value={`${dash.summary.p95Latency}ms`} />
          <SummaryCard label="Slow (>2s)" value={dash.summary.slowRequestCount.toLocaleString()} variant={dash.summary.slowRequestCount > 10 ? "red" : undefined} />
        </div>
      )}

      {/* Crawler Health Trend */}
      {healthData?.data && healthData.data.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Crawler Health Trend</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2">Hour</th>
                  <th className="px-3 py-2">Requests</th>
                  <th className="px-3 py-2">Errors</th>
                  <th className="px-3 py-2">404s</th>
                  <th className="px-3 py-2">Redirects</th>
                  <th className="px-3 py-2">Avg Latency</th>
                  <th className="px-3 py-2">P95 Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {healthData.data.slice(-24).map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-500">{new Date(h.hour).toLocaleTimeString()}</td>
                    <td className="px-3 py-2">{h.total}</td>
                    <td className={`px-3 py-2 ${h.errors > 0 ? "text-red-600" : "text-gray-500"}`}>{h.errors}</td>
                    <td className={`px-3 py-2 ${h.not_found > 0 ? "text-yellow-600" : "text-gray-500"}`}>{h.not_found}</td>
                    <td className="px-3 py-2 text-gray-500">{h.redirects}</td>
                    <td className="px-3 py-2">{h.avg_latency}ms</td>
                    <td className="px-3 py-2">{h.p95_latency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Breakdowns */}
      {dash && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BreakdownCard title="By Crawler Type" items={dash.byCrawlerType.map((r) => ({ label: CRAWLER_LABELS[r.type] || r.type, value: r.count }))} />
          <BreakdownCard title="By HTTP Status" items={dash.byStatus.map((r) => ({ label: String(r.status), value: r.count }))} />
          <BreakdownCard title="By Page Type" items={dash.byPageType.map((r) => ({ label: r.type.replace(/_/g, " "), value: r.count }))} />
        </div>
      )}

      {/* Top Lists */}
      {dash && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopListCard title="Top Crawled URLs" items={dash.topUrls.map((r) => ({ label: r.url, count: r.count }))} />
          <TopListCard title="Top 404 URLs" items={dash.top404s.map((r) => ({ label: r.url, count: r.count }))} warn />
          <TopListCard title="Top Occupations" items={dash.topOccupations.map((r) => ({ label: r.occupation, count: r.count }))} />
          <TopListCard title="Top States" items={dash.topStates.map((r) => ({ label: r.state, count: r.count }))} />
          <TopListCard title="Top Cities" items={dash.topCities.map((r) => ({ label: r.city, count: r.count }))} />
          <TopListCard title="Top Job IDs" items={dash.topJobIds.map((r) => ({ label: r.jobId, count: r.count }))} />
          <TopListCard title="Expired (410) URLs" items={dash.topExpired.map((r) => ({ label: r.url, count: r.count }))} warn />
        </div>
      )}

      {/* Request Log */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Request Log</h3>
          <input
            type="text"
            placeholder="Filter by URL..."
            value={requestUrl}
            onChange={(e) => setRequestUrl(e.target.value)}
            className="max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Crawler</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Page Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Latency</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {requestsLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : (requestsData?.data || []).length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No requests found</td></tr>
              ) : (
                requestsData?.data.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{new Date(req.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{req.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        req.httpStatus >= 500 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        req.httpStatus >= 400 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        req.httpStatus >= 300 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}>{req.httpStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div className={req.ipVerified ? "text-green-600" : "text-red-500"}>{CRAWLER_LABELS[req.crawlerType] || req.crawlerType}</div>
                      {req.verifiedClientIp && <div className="font-mono text-gray-400">{req.verifiedClientIp}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{req.seoPageType.replace(/_/g, " ")}</td>
                    <td className={`px-4 py-3 text-xs font-mono ${req.responseTimeMs > 2000 ? "text-red-600" : "text-gray-500"}`}>{req.responseTimeMs}ms</td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-600 dark:text-gray-400" title={req.url}>{req.url}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, variant }: { label: string; value: string; variant?: string }) {
  const colors = variant === "green" ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
    : variant === "red" ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
    : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700";
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colors}`}>
      <div className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-1 p-4">
        {items.slice(0, 10).map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="w-24 truncate text-gray-600 dark:text-gray-400">{item.label}</span>
            <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <span className="w-10 text-right font-mono text-gray-500">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopListCard({ title, items, warn }: { title: string; items: { label: string; count: number }[]; warn?: boolean }) {
  return (
    <div className={`rounded-xl border shadow-sm ${
      warn ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10"
        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    }`}>
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.slice(0, 10).map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-2 text-xs">
            <span className="truncate text-gray-600 dark:text-gray-400" title={item.label}>{i + 1}. {item.label}</span>
            <span className="ml-3 font-mono text-gray-500">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
