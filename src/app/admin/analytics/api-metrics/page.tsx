'use client'

import { useState } from 'react'
import OverviewStats from '@/components/admin/api-metrics/OverviewStats'
import StatusCodeChart from '@/components/admin/api-metrics/StatusCodeChart'
import TopEndpointsChart from '@/components/admin/api-metrics/TopEndpointsChart'
import RequestLogTable from '@/components/admin/api-metrics/RequestLogTable'
import EndpointsTable from '@/components/admin/api-metrics/EndpointsTable'

type TabType = 'overview' | 'logs' | 'endpoints'

export default function ApiMetricsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [timeWindow, setTimeWindow] = useState<24 | 168 | 720>(24)

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'logs' as const, label: 'Request Log', icon: '📋' },
    { id: 'endpoints' as const, label: 'Endpoints', icon: '🔗' },
  ]

  const timeOptions = [
    { value: 24, label: 'Last 24 Hours' },
    { value: 168, label: 'Last 7 Days' },
    { value: 720, label: 'Last 30 Days' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            API Metrics
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track API endpoint usage, response status codes, and latency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Window:
          </label>
          <select
            value={timeWindow}
            onChange={(e) =>
              setTimeWindow(Number(e.target.value) as 24 | 168 | 720)
            }
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

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OverviewStats timeWindow={timeWindow} />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <StatusCodeChart timeWindow={timeWindow} />
              <TopEndpointsChart timeWindow={timeWindow} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && <RequestLogTable timeWindow={timeWindow} />}

        {activeTab === 'endpoints' && <EndpointsTable timeWindow={timeWindow} />}
      </div>
    </div>
  )
}
