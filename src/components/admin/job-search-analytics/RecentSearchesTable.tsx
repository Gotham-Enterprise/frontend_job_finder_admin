'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'

export default function RecentSearchesTable() {
  const [page, setPage] = useState(1)
  const limit = 50

  const { data, isLoading } = useQuery({
    queryKey: ['recentSearches', page, limit],
    queryFn: () => jobSearchAnalyticsAPI.getRecentSearches(page, limit)
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.success || !data.data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No recent searches found
      </div>
    )
  }

  const searches = data.data
  const metaData = data.metaData

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Results
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {searches.map((search) => (
              <tr key={search.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {new Date(search.searchedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {search.keyword || <span className="text-gray-400">(empty)</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {search.location || search.locationCity || search.locationState || (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {search.resultsCount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {search.userId ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Authenticated
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Guest
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                  {search.ipAddress || <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(page * limit, metaData.totalCount)}
          </span>{' '}
          of <span className="font-medium">{metaData.totalCount}</span> results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(metaData.totalPages, p + 1))}
            disabled={page === metaData.totalPages}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
