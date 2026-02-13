'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import OverviewStats from '@/components/admin/job-search-analytics/OverviewStats'
import KeywordAnalytics from '@/components/admin/job-search-analytics/KeywordAnalytics'
import LocationAnalytics from '@/components/admin/job-search-analytics/LocationAnalytics'
import FilterAnalytics from '@/components/admin/job-search-analytics/FilterAnalytics'
import SearchTrendsChart from '@/components/admin/job-search-analytics/SearchTrendsChart'
import RecentSearchesTable from '@/components/admin/job-search-analytics/RecentSearchesTable'

type TabType = 'overview' | 'keywords' | 'locations' | 'filters' | 'recent'

export default function JobSearchAnalyticsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize active tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'keywords', 'locations', 'filters', 'recent'].includes(tabParam)) {
      return tabParam as TabType
    }
    return 'overview'
  })
  
  const [timeWindow, setTimeWindow] = useState<24 | 168 | 720>(24) // 24h, 7d, 30d

  // Sync tab changes with URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Update active tab when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'keywords', 'locations', 'filters', 'recent'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'keywords' as const, label: 'Keywords', icon: '🔍' },
    { id: 'locations' as const, label: 'Locations', icon: '📍' },
    { id: 'filters' as const, label: 'Filters', icon: '⚙️' },
    { id: 'recent' as const, label: 'Recent Searches', icon: '🕐' }
  ]

  const timeOptions = [
    { value: 24, label: 'Last 24 Hours' },
    { value: 168, label: 'Last 7 Days' },
    { value: 720, label: 'Last 30 Days' }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Job Search Analytics
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track and analyze how users search for jobs
          </p>
        </div>
        
        {/* Time Window Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Window:
          </label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value) as 24 | 168 | 720)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OverviewStats timeWindow={timeWindow} />
            <SearchTrendsChart days={timeWindow === 24 ? 7 : timeWindow === 168 ? 30 : 90} />
          </div>
        )}
        
        {activeTab === 'keywords' && (
          <KeywordAnalytics timeWindow={timeWindow} />
        )}
        
        {activeTab === 'locations' && (
          <LocationAnalytics />
        )}
        
        {activeTab === 'filters' && (
          <FilterAnalytics />
        )}
        
        {activeTab === 'recent' && (
          <RecentSearchesTable />
        )}
      </div>
    </div>
  )
}
