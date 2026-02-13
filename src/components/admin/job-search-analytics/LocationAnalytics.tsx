'use client'

import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'

export default function LocationAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['locationAnalytics'],
    queryFn: () => jobSearchAnalyticsAPI.getLocationAnalytics()
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-4 space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load location analytics
      </div>
    )
  }

  const { topStates, topCities } = data.data

  const maxStateCount = topStates[0]?.count || 1
  const maxCityCount = topCities[0]?.count || 1

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top States */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Top States
        </h3>
        <div className="space-y-4">
          {topStates.map((item, index) => (
            <div key={item.state} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600 dark:bg-green-900 dark:text-green-300">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.state}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(item.count / maxStateCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Top Cities
        </h3>
        <div className="space-y-4">
          {topCities.map((item, index) => (
            <div key={item.city} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.city}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${(item.count / maxCityCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
