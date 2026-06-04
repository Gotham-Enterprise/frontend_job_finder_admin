'use client'

import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { apiRequestLogAPI } from '@/services/api/apiRequestLogAPI'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TopEndpointsChartProps {
  timeWindow: number
  limit?: number
}

export default function TopEndpointsChart({
  timeWindow,
  limit = 10,
}: TopEndpointsChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['apiTopEndpoints', timeWindow, limit],
    queryFn: () => apiRequestLogAPI.getTopEndpoints(timeWindow, limit),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800" />
    )
  }

  const endpoints = data?.data || []
  if (!endpoints.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No endpoint data in this time window
      </div>
    )
  }

  const labels = endpoints.map((e) => `${e.method} ${e.routeKey}`)
  const counts = endpoints.map((e) => e.count)

  const chartOptions = {
    chart: { type: 'bar' as const, toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, barHeight: '70%' },
    },
    xaxis: { categories: labels },
    dataLabels: { enabled: false },
    colors: ['#3b82f6'],
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Top API Endpoints
      </h3>
      <ApexChart
        type="bar"
        height={Math.max(280, endpoints.length * 36)}
        options={chartOptions}
        series={[{ name: 'Requests', data: counts }]}
      />
    </div>
  )
}
