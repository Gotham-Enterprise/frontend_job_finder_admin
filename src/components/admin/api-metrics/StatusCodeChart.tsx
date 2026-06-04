'use client'

import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { apiRequestLogAPI } from '@/services/api/apiRequestLogAPI'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface StatusCodeChartProps {
  timeWindow: number
}

function statusColor(code: number): string {
  if (code >= 500) return '#ef4444'
  if (code >= 400) return '#f59e0b'
  if (code >= 300) return '#3b82f6'
  return '#22c55e'
}

export default function StatusCodeChart({ timeWindow }: StatusCodeChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['apiStatusCodes', timeWindow],
    queryFn: () => apiRequestLogAPI.getStatusCodeBreakdown(timeWindow),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800" />
    )
  }

  const breakdown = data?.data || []
  if (!breakdown.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No status code data in this time window
      </div>
    )
  }

  const chartOptions = {
    chart: { type: 'donut' as const },
    labels: breakdown.map((b) => String(b.statusCode)),
    colors: breakdown.map((b) => statusColor(b.statusCode)),
    legend: { position: 'bottom' as const },
    dataLabels: { enabled: true },
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Status Code Distribution
      </h3>
      <ApexChart
        type="donut"
        height={320}
        options={chartOptions}
        series={breakdown.map((b) => b.count)}
      />
    </div>
  )
}
