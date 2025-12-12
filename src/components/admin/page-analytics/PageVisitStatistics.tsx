'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pageVisitAPI } from '@/services/pageVisitAPI'
import dynamic from 'next/dynamic'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function PageVisitStatistics() {
  const [selectedHours, setSelectedHours] = useState(24)
  const [selectedPage, setSelectedPage] = useState('')
  const [topPagesLimit, setTopPagesLimit] = useState(10)
  const [topPagesSortOrder, setTopPagesSortOrder] = useState<'desc' | 'asc'>('desc')

  const { data: topPagesData } = useQuery({
    queryKey: ['top-pages', selectedHours, topPagesLimit],
    queryFn: () => pageVisitAPI.getTopPages(topPagesLimit, selectedHours),
    refetchInterval: 30000,
  })

  const { data: alertHistoryData } = useQuery({
    queryKey: ['alert-history'],
    queryFn: () => pageVisitAPI.getAlertHistory({ limit: 50 }),
    refetchInterval: 30000,
  })

  const { data: thresholdsData } = useQuery({
    queryKey: ['page-visit-thresholds'],
    queryFn: () => pageVisitAPI.getThresholds(),
    refetchInterval: 30000,
  })

  // Fetch statistics for top 5 pages
  const { data: statisticsData } = useQuery({
    queryKey: ['page-visit-statistics-multi', selectedHours],
    queryFn: async () => {
      const thresholds = thresholdsData?.data || []
      const top5Pages = thresholds.slice(0, 5)
      
      if (top5Pages.length === 0) return []
      
      const results = await Promise.all(
        top5Pages.map(threshold => 
          pageVisitAPI.getStatistics(threshold.pageUrl, selectedHours)
        )
      )
      
      return results.map(r => r.data)
    },
    enabled: !!thresholdsData?.data && thresholdsData.data.length > 0,
    refetchInterval: 30000,
  })

  const topPages = topPagesData?.data || []
  const alerts = alertHistoryData?.data || []
  const thresholds = thresholdsData?.data || []
  const statistics = statisticsData || []

  // Sort top pages based on selected order
  const sortedTopPages = [...topPages].sort((a, b) => {
    return topPagesSortOrder === 'desc' ? b.count - a.count : a.count - b.count
  })

  // Prepare chart data with real statistics
  const chartData = {
    series: statistics.map((stat) => ({
      name: stat.pageUrl,
      data: stat.trend.map((t: any) => t.count),
    })),
    options: {
      chart: {
        type: 'line' as const,
        height: 350,
        toolbar: { show: true },
      },
      stroke: { curve: 'smooth' as const, width: 2 },
      xaxis: {
        categories: statistics[0]?.trend.map((t: any, i: number) => {
          const date = new Date(t.timestamp)
          return selectedHours <= 24 
            ? date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }) || [],
      },
      yaxis: { title: { text: 'Visits' } },
      legend: { position: 'top' as const },
      theme: { mode: 'light' as const },
    },
  }

  const barChartData = {
    series: [{
      name: 'Current Visits',
      data: thresholds.slice(0, 10).map(t => t.currentCount || 0),
    }, {
      name: 'Threshold',
      data: thresholds.slice(0, 10).map(t => t.expectedVisits),
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: { position: 'top' as const },
        },
      },
      xaxis: {
        categories: thresholds.slice(0, 10).map(t => t.pageUrl.substring(0, 30)),
      },
      colors: ['#3b82f6', '#10b981'],
      legend: { position: 'top' as const },
    },
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Visit Statistics
        </h2>
        <select
          value={selectedHours}
          onChange={(e) => setSelectedHours(parseInt(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value={1}>Last Hour</option>
          <option value={6}>Last 6 Hours</option>
          <option value={24}>Last 24 Hours</option>
          <option value={168}>Last 7 Days</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monitored Pages</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {thresholds.filter(t => t.enabled).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</p>
          <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">
            {thresholds.filter(t => t.isExceeding).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alerts Today</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600 dark:text-amber-400">
            {alerts.filter(a => new Date(a.alertSentAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visits</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {topPages.reduce((sum, page) => sum + page.count, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Visit Trends Chart */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Visit Trends - Top 5 Pages
        </h3>
        {statistics.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-gray-500 dark:text-gray-400">
            No data available. Create thresholds to start tracking page visits.
          </div>
        ) : (
          typeof window !== 'undefined' && (
            <ApexChart
              options={chartData.options}
              series={chartData.series}
              type="line"
              height={350}
            />
          )
        )}
      </div>

      {/* Current vs Threshold Comparison */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Current Visits vs Thresholds
        </h3>
        {typeof window !== 'undefined' && (
          <ApexChart
            options={barChartData.options}
            series={barChartData.series}
            type="bar"
            height={350}
          />
        )}
      </div>

      {/* Top Pages Table */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Visited Pages
          </h3>
          <div className="flex items-center space-x-4">
            {/* Limit Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show:
              </label>
              <select
                value={topPagesLimit}
                onChange={(e) => setTopPagesLimit(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setTopPagesSortOrder(topPagesSortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <span>Sort:</span>
              <span className="font-semibold">
                {topPagesSortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
              </span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Page URL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Visits
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTopPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {page.pageUrl}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {page.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert History */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Triggered At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Visits / Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Time Window
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {alerts.slice(0, 10).map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {alert.pageUrl}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(alert.alertSentAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {alert.visitCount}
                    </span>
                    <span className="text-gray-500"> / </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.expectedVisits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {alert.timeWindowHours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
