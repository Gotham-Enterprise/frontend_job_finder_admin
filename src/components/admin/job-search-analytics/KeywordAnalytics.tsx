'use client'

import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'

interface KeywordAnalyticsProps {
  timeWindow: number
}

export default function KeywordAnalytics({ timeWindow }: KeywordAnalyticsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['topKeywords'],
    queryFn: () => jobSearchAnalyticsAPI.getTopKeywords(50)
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.success || !data.data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No keyword data available
      </div>
    )
  }

  const keywords = data.data
  const maxCount = keywords[0]?.count || 1

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Top Search Keywords
      </h3>
      <div className="space-y-4">
        {keywords.map((item, index) => (
          <div key={item.keyword} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.keyword || '(empty search)'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {item.count.toLocaleString()} searches
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
