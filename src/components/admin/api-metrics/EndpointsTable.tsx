'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequestLogAPI } from '@/services/api/apiRequestLogAPI'

interface EndpointsTableProps {
  timeWindow: number
}

export default function EndpointsTable({ timeWindow }: EndpointsTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['apiEndpointsTable', timeWindow],
    queryFn: () => apiRequestLogAPI.getTopEndpoints(timeWindow, 50),
    refetchInterval: 30000,
  })

  const endpoints = data?.data || []

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    )
  }

  if (!endpoints.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No endpoint aggregates in this time window
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                Total Hits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                Status Breakdown
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {endpoints.map((ep) => (
              <tr key={`${ep.method}-${ep.routeKey}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-mono font-medium text-gray-900 dark:text-white">
                  {ep.method}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-300">
                  {ep.routeKey}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {ep.count.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex flex-wrap gap-2">
                    {ep.statusBreakdown
                      .sort((a, b) => a.statusCode - b.statusCode)
                      .map((s) => (
                        <span
                          key={s.statusCode}
                          className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-700"
                        >
                          {s.statusCode}: {s.count}
                        </span>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
