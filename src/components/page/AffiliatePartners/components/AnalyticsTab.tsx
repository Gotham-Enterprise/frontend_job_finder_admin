'use client'

import React, { useState } from 'react'
import { useAffiliateAnalytics, useAffiliatePartners } from '@/services/hooks/useAffiliates'
import dynamic from 'next/dynamic'
import { TrendingUp, Users, MousePointerClick, Trophy } from 'lucide-react'
import DatePicker from '@/components/form/date-picker'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function AnalyticsTab() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const { data: partnersData } = useAffiliatePartners({ limit: 100 })
  const { data: analytics, isLoading } = useAffiliateAnalytics({
    affiliateId: selectedPartnerId || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: analytics?.clicksOverTime?.map((d) => new Date(d.date).toLocaleDateString()) || [],
      labels: {
        style: {
          colors: '#9ca3af',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
        },
      },
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3,
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy',
      },
    },
    colors: ['#3b82f6', '#8b5cf6'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#9ca3af',
      },
    },
  }

  const chartSeries = [
    {
      name: 'Total Clicks',
      data: analytics?.clicksOverTime?.map((d) => d.clicks) || [],
    },
    {
      name: 'Unique IP Addresses',
      data: analytics?.clicksOverTime?.map((d) => d.uniqueIpAddresses) || [],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Partner Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Partner
          </label>
          <select
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Partners</option>
            {partnersData?.data.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <DatePicker
            key={`start-${dateRange.startDate}`}
            id="analytics-start-date"
            label="Start Date"
            placeholder="Select start date"
            mode="single"
            defaultDate={dateRange.startDate}
            onChange={(selectedDates) => {
              if (selectedDates && selectedDates.length > 0) {
                // Use the dateString directly from flatpickr to avoid timezone issues
                const dateStr = selectedDates[0] as any
                if (typeof dateStr === 'string') {
                  setDateRange({ ...dateRange, startDate: dateStr })
                } else {
                  // If it's a Date object, format it in local time
                  const year = dateStr.getFullYear()
                  const month = String(dateStr.getMonth() + 1).padStart(2, '0')
                  const day = String(dateStr.getDate()).padStart(2, '0')
                  setDateRange({ ...dateRange, startDate: `${year}-${month}-${day}` })
                }
              }
            }}
          />
        </div>

        {/* End Date */}
        <div>
          <DatePicker
            key={`end-${dateRange.endDate}`}
            id="analytics-end-date"
            label="End Date"
            placeholder="Select end date"
            mode="single"
            defaultDate={dateRange.endDate}
            onChange={(selectedDates) => {
              if (selectedDates && selectedDates.length > 0) {
                // Use the dateString directly from flatpickr to avoid timezone issues
                const dateStr = selectedDates[0] as any
                if (typeof dateStr === 'string') {
                  setDateRange({ ...dateRange, endDate: dateStr })
                } else {
                  // If it's a Date object, format it in local time
                  const year = dateStr.getFullYear()
                  const month = String(dateStr.getMonth() + 1).padStart(2, '0')
                  const day = String(dateStr.getDate()).padStart(2, '0')
                  setDateRange({ ...dateRange, endDate: `${year}-${month}-${day}` })
                }
              }
            }}
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Total Clicks</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-2">
                {analytics?.totalClicks?.toLocaleString() || 0}
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-blue-600 dark:text-blue-500" />
          </div>
        </div>

        {/* <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Unique Candidates
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">
                {analytics?.uniqueCandidates?.toLocaleString() || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
        </div> */}

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                Unique IP Addresses
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-2">
                {analytics?.uniqueIpAddresses?.toLocaleString() || 0}
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-purple-600 dark:text-purple-500" />
          </div>
        </div>
      </div>

      {/* Clicks Over Time Chart */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clicks Over Time</h3>
        </div>
        {analytics?.clicksOverTime && analytics.clicksOverTime.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={350}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No data available for selected period
          </div>
        )}
      </div>

      {/* Top Performing Jobs */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Jobs
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Clicks
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unique IPs
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
              {analytics?.topJobs && analytics.topJobs.length > 0 ? (
                analytics.topJobs.map((job, index) => (
                  <tr
                    key={job.jobId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="text-yellow-500 font-bold text-lg">🥇</span>
                        )}
                        {index === 1 && (
                          <span className="text-gray-400 font-bold text-lg">🥈</span>
                        )}
                        {index === 2 && (
                          <span className="text-orange-600 font-bold text-lg">🥉</span>
                        )}
                        {index > 2 && (
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {job.affiliate?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                        <MousePointerClick className="w-3 h-3" />
                        {job.clicks}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                        <MousePointerClick className="w-3 h-3" />
                        {job.uniqueIpAddresses || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
