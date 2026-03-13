'use client'

import React, { useState } from 'react'
import { useAffiliateAnalytics, useAffiliatePartners } from '@/services/hooks/useAffiliates'
import dynamic from 'next/dynamic'
import { TrendingUp, Users, MousePointerClick, Trophy, DollarSign, CheckCircle, BarChart2, Briefcase } from 'lucide-react'
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
      y: {
        formatter: function(value) {
          return value !== undefined && value !== null ? value.toString() : '0';
        }
      },
      style: {
        fontSize: '13px',
        fontFamily: 'inherit',
      },
      marker: {
        show: true,
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const date = w.globals.categoryLabels[dataPointIndex];
        const seriesNames = ['Total Clicks', 'Unique IP Addresses', 'Logged In Users', 'Guest Users'];
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'];
        
        let tooltipHtml = `
          <div style="background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 12px; min-width: 200px;">
            <div style="color: #f3f4f6; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
              ${date}
            </div>
        `;
        
        series.forEach((s: number[], idx: number) => {
          const value = s[dataPointIndex];
          tooltipHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; background: ${colors[idx]}; border-radius: 2px; display: inline-block;"></span>
                <span style="color: #e5e7eb; font-size: 13px;">${seriesNames[idx]}:</span>
              </div>
              <span style="color: #ffffff; font-weight: 600; font-size: 13px; margin-left: 12px;">${value !== undefined && value !== null ? value : 0}</span>
            </div>
          `;
        });
        
        tooltipHtml += `</div>`;
        return tooltipHtml;
      }
    },
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#9ca3af',
      },
      markers: {
        size: 6,
        offsetX: -2,
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
    {
      name: 'Logged In Users',
      data: analytics?.clicksOverTime?.map((d) => d.authenticatedClicks) || [],
    },
    {
      name: 'Guest Users',
      data: analytics?.clicksOverTime?.map((d) => d.guestClicks) || [],
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

      {/* Job Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Active Jobs</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">
                {analytics?.publishedAffiliateJobs?.toLocaleString() ?? 0}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {selectedPartnerId ? 'Live jobs from this partner' : 'Live jobs across all partners'}
              </p>
            </div>
            <Briefcase className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Logged In User Clicks
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">
                {analytics?.authenticatedClicks?.toLocaleString() || 0}
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                Guest User Clicks
              </p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-300 mt-2">
                {analytics?.guestClicks?.toLocaleString() || 0}
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-orange-600 dark:text-orange-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                Unique IP Address Clicks
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-2">
                {analytics?.uniqueIpAddresses?.toLocaleString() || 0}
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-purple-600 dark:text-purple-500" />
          </div>
        </div>
      </div>

      {/* Redirect Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Auto-Redirects</p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 mt-2">
                {analytics?.autoRedirectClicks?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-500 mt-1">
                Automated job redirects
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-indigo-600 dark:text-indigo-500" />
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">Manual Clicks</p>
              <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-300 mt-2">
                {analytics?.manualClicks?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-1">
                User-initiated clicks
              </p>
            </div>
            <MousePointerClick className="w-12 h-12 text-cyan-600 dark:text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Conversion Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total Conversions</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mt-2">
                {analytics?.totalConversions?.toLocaleString() ?? 0}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">S2S postback receipts</p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-500" />
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-teal-900 dark:text-teal-300 mt-2">
                {analytics?.conversionRate ?? 0}%
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-500 mt-1">Conversions / Clicks</p>
            </div>
            <BarChart2 className="w-12 h-12 text-teal-600 dark:text-teal-500" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Total Payout</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300 mt-2">
                ${(analytics?.totalPayout ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Earned from conversions</p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
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

      {/* Redirects by Job Title */}
      {analytics?.redirectsByJobTitle && analytics.redirectsByJobTitle.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto-Redirects by Job Title
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Auto-Redirects
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total Auto-Redirects
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                {analytics.redirectsByJobTitle.map((item, index) => (
                  <tr
                    key={item.jobTitle}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {item.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {analytics.autoRedirectClicks
                          ? ((item.count / analytics.autoRedirectClicks) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conversions Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversions</h3>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Latest 100</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partner Conv. ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Converted At</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
              {analytics?.conversions && analytics.conversions.length > 0 ? (
                analytics.conversions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{c.jobTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{c.partner}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {c.payout != null ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                          <DollarSign className="w-3 h-3" />
                          {c.payout.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-600">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {c.partnerConversionId ?? <span className="text-gray-400">&mdash;</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(c.convertedAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No conversions recorded yet
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
