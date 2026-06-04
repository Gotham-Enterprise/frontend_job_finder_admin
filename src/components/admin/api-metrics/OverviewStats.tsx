'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequestLogAPI } from '@/services/api/apiRequestLogAPI'

interface OverviewStatsProps {
  timeWindow: number
}

export default function OverviewStats({ timeWindow }: OverviewStatsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['apiRequestOverview', timeWindow],
    queryFn: () => apiRequestLogAPI.getOverview(timeWindow),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !data?.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load API metrics. Ensure API_REQUEST_LOG_ENABLED is on and requests have been made.
      </div>
    )
  }

  const stats = data.data

  const cards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      icon: '📡',
    },
    {
      title: '2xx Success',
      value: stats.count2xx.toLocaleString(),
      icon: '✅',
    },
    {
      title: '4xx Client Errors',
      value: stats.count4xx.toLocaleString(),
      icon: '⚠️',
    },
    {
      title: '5xx Server Errors',
      value: stats.count5xx.toLocaleString(),
      icon: '❌',
    },
    {
      title: 'Avg Latency',
      value: `${stats.avgDurationMs}ms`,
      icon: '⚡',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
