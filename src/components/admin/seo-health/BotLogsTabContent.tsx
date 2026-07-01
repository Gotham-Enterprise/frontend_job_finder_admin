"use client";

import { useBotLogs } from "@/services/hooks/useSeoReports";

export default function BotLogsTabContent() {
  const { data: botLogsData, isPending: botLogsPending, error: botLogsError } = useBotLogs();

  if (botLogsPending) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading bot traffic logs...
      </div>
    );
  }

  if (botLogsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load bot traffic logs.
      </div>
    );
  }

  if (!botLogsData?.data || botLogsData.data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No recent Googlebot traffic logs found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Googlebot Traffic</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Showing the most recent {botLogsData.data.length} crawl requests from the server logs.
          </p>
        </div>
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">URL</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">IP / User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {botLogsData.data.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 break-all max-w-md">
                    {log.url}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="font-mono text-xs">{log.ip}</div>
                    <div className="text-xs mt-1 text-gray-400">{log.userAgent}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
