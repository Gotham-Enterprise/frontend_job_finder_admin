'use client'

import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'

export default function FilterAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['filterUsage'],
    queryFn: () => jobSearchAnalyticsAPI.getFilterUsage()
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-4 space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.success || !data.data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No filter usage data available
      </div>
    )
  }

  const filters = data.data

  // Map filter keys to readable names
  const getReadableFilterName = (filterKey: string): string => {
    const nameMap: Record<string, string> = {
      specialtyId: 'Specialty',
      occupationId: 'Occupation',
      workTypeId: 'Work Type',
      workFacilityId: 'Work Facility',
      workSettingId: 'Work Setting',
      shiftTypeId: 'Shift Type',
      salaryMin: 'Minimum Salary',
      salaryMax: 'Maximum Salary',
      experienceYears: 'Years of Experience',
      educationLevel: 'Education Level',
      certifications: 'Certifications',
      radius: 'Search Radius',
      datePosted: 'Date Posted',
      employmentType: 'Employment Type',
      remote: 'Remote Work',
    }
    return nameMap[filterKey] || filterKey.replace(/([A-Z])/g, ' $1').trim()
  }

  return (
    <div className="space-y-6">
      {filters.map((filter) => {
        const maxCount = filter.values[0]?.count || 1
        const readableName = getReadableFilterName(filter.filterName)

        return (
          <div
            key={filter.filterName}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {readableName}
            </h3>
            <div className="space-y-3">
              {filter.values.map((item, index) => {
                let displayValue = item.value
                try {
                  const parsed = JSON.parse(item.value)
                  // If it's a string after parsing, use it directly
                  displayValue = typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
                } catch {
                  // Keep original value if not JSON
                }

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {displayValue}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {item.count.toLocaleString()} searches
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
