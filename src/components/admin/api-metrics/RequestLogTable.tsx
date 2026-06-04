'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiRequestLogAPI } from '@/services/api/apiRequestLogAPI'

interface RequestLogTableProps {
  timeWindow: number
}

function statusBadgeClass(code: number): string {
  if (code >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (code >= 400) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

export default function RequestLogTable({ timeWindow }: RequestLogTableProps) {
  const [page, setPage] = useState(1)
  const [method, setMethod] = useState('')
  const [statusCode, setStatusCode] = useState('')
  const [pathFilter, setPathFilter] = useState('')
  const limit = 50

  const { data, isLoading } = useQuery({
    queryKey: ['apiRequestLogs', page, limit, timeWindow, method, statusCode, pathFilter],
    queryFn: () =>
      apiRequestLogAPI.getLogs({
        page,
        limit,
        hours: timeWindow,
        method: method || undefined,
        statusCode: statusCode ? parseInt(statusCode, 10) : undefined,
        path: pathFilter || undefined,
      }),
    refetchInterval: 30000,
  })

  const logs = data?.data || []
  const meta = data?.metaData

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All methods</option>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Status code"
          value={statusCode}
          onChange={(e) => {
            setStatusCode(e.target.value)
            setPage(1)
          }}
          className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          placeholder="Filter by path..."
          value={pathFilter}
          onChange={(e) => {
            setPathFilter(e.target.value)
            setPage(1)
          }}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="p-6 animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : !logs.length ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No API requests logged in this time window
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Path
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {new Date(log.requestedAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-300">
                      {log.method}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-300" title={log.path}>
                      {log.path}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm font-mono text-gray-500 dark:text-gray-400" title={log.routeKey || ''}>
                      {log.routeKey || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {log.durationMs}ms
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {log.userId ? log.userId.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {meta.page} of {meta.totalPages} ({meta.totalCount.toLocaleString()} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
