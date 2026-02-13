'use client'

import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'

interface OverviewStatsProps {
  timeWindow: number
}

export default function OverviewStats({ timeWindow }: OverviewStatsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobSearchStats', timeWindow],
    queryFn: () => jobSearchAnalyticsAPI.getStatistics(timeWindow)
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-2 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data?.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load statistics. Please try again.
      </div>
    )
  }

  const stats = data.data.overview

  const cards = [
    {
      title: 'Total Searches',
      value: stats.totalSearches.toLocaleString(),
      icon: '🔍',
      color: 'blue'
    },
    {
      title: `Searches (Last ${timeWindow}h)`,
      value: stats.searchesInTimeWindow.toLocaleString(),
      icon: '📈',
      color: 'green'
    },
    {
      title: 'Avg Results Per Search',
      value: stats.avgResultsPerSearch.toLocaleString(),
      icon: '📊',
      color: 'purple'
    },
    {
      title: 'Avg Search Time',
      value: `${stats.avgSearchTime}ms`,
      icon: '⚡',
      color: 'yellow'
    }
  ]

  const userTypeData = data.data.userTypeBreakdown
  const authPercentage = userTypeData.total > 0 
    ? Math.round((userTypeData.authenticated / userTypeData.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User Type Breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          User Type Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Authenticated Users</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {userTypeData.authenticated.toLocaleString()} ({authPercentage}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Guest Users</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {userTypeData.guest.toLocaleString()} ({100 - authPercentage}%)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${authPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
