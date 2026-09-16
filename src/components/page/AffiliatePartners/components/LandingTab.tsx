'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MousePointerClick, Globe, Users } from 'lucide-react'
import DatePicker from '@/components/form/date-picker'
import Pagination from '@/components/tables/Pagination'
import { useAffiliatePartners, useLandingAnalytics, useLandingClicks } from '@/services/hooks/useAffiliates'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

function getDefaultStartDate(): string {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNullable(value: string | null | undefined): string {
  if (!value || !value.trim()) return '—'
  return value
}

export default function LandingTab() {
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getTodayDate(),
  })
  const [deduplicate, setDeduplicate] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 25

  const { data: partnersData } = useAffiliatePartners({ landingEnabled: true, limit: 100 })
  const landingPartners = partnersData?.data ?? []

  const analyticsFilters = useMemo(
    () => ({
      affiliateId: selectedPartnerId || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      deduplicate,
    }),
    [selectedPartnerId, dateRange.startDate, dateRange.endDate, deduplicate]
  )

  const clickFilters = useMemo(
    () => ({
      affiliateId: selectedPartnerId || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      page,
      limit,
    }),
    [selectedPartnerId, dateRange.startDate, dateRange.endDate, page]
  )

  const { data: analytics, isLoading: analyticsLoading } = useLandingAnalytics(analyticsFilters)
  const { data: clicksData, isLoading: clicksLoading } = useLandingClicks(clickFilters)

  const handleStartDateChange = (selectedDates: Date[] | string[]) => {
    if (!selectedDates?.length) return
    const dateStr = selectedDates[0] as Date | string
    if (typeof dateStr === 'string') {
      setDateRange((prev) => ({ ...prev, startDate: dateStr }))
    } else {
      const year = dateStr.getFullYear()
      const month = String(dateStr.getMonth() + 1).padStart(2, '0')
      const day = String(dateStr.getDate()).padStart(2, '0')
      setDateRange((prev) => ({ ...prev, startDate: `${year}-${month}-${day}` }))
    }
    setPage(1)
  }

  const handleEndDateChange = (selectedDates: Date[] | string[]) => {
    if (!selectedDates?.length) return
    const dateStr = selectedDates[0] as Date | string
    if (typeof dateStr === 'string') {
      setDateRange((prev) => ({ ...prev, endDate: dateStr }))
    } else {
      const year = dateStr.getFullYear()
      const month = String(dateStr.getMonth() + 1).padStart(2, '0')
      const day = String(dateStr.getDate()).padStart(2, '0')
      setDateRange((prev) => ({ ...prev, endDate: `${year}-${month}-${day}` }))
    }
    setPage(1)
  }

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
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
      labels: { style: { colors: '#9ca3af' } },
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } },
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3,
    },
    tooltip: { theme: 'dark' },
    colors: ['#3b82f6', '#8b5cf6'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: '#9ca3af' },
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

  const clicks = clicksData?.data ?? []
  const pagination = clicksData?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Landing Traffic</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Visits from partners that send a single tracking URL (no XML feed). Each hit is logged, then the visitor is redirected home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Partner
          </label>
          <select
            value={selectedPartnerId}
            onChange={(e) => {
              setSelectedPartnerId(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">All landing partners</option>
            {landingPartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <DatePicker
            key={`landing-start-${dateRange.startDate}`}
            id="landing-start-date"
            label="Start Date"
            placeholder="Select start date"
            mode="single"
            defaultDate={dateRange.startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div>
          <DatePicker
            key={`landing-end-${dateRange.endDate}`}
            id="landing-end-date"
            label="End Date"
            placeholder="Select end date"
            mode="single"
            defaultDate={dateRange.endDate}
            onChange={handleEndDateChange}
          />
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={(e) => setDeduplicate(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Count unique IPs</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MousePointerClick className="w-4 h-4" />
            Total Clicks
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {analyticsLoading ? '—' : (analytics?.totalClicks ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            Unique IPs
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {analyticsLoading ? '—' : (analytics?.uniqueIpAddresses ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : analytics?.clicksOverTime?.length ? (
          <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No landing clicks for the selected period
          </div>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Click log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
              {clicksLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  </td>
                </tr>
              ) : clicks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No tracked visits yet
                  </td>
                </tr>
              ) : (
                clicks.map((click) => (
                  <tr key={click.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDateTime(click.clickedAt)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {click.affiliate?.name || '—'}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                      {formatNullable(click.ipAddress)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={click.userAgent || undefined}>
                      {formatNullable(click.userAgent)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {click.referrer ? (
                        <span className="inline-flex items-center gap-1" title={click.referrer}>
                          <Globe className="w-3 h-3 shrink-0" />
                          {click.referrer}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} clicks)
            </div>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
