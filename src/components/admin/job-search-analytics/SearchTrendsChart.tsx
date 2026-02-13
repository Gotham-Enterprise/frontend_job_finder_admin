'use client'

import { useQuery } from '@tanstack/react-query'
import { jobSearchAnalyticsAPI } from '@/services/api/jobSearchAnalyticsAPI'
import dynamic from 'next/dynamic'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface SearchTrendsChartProps {
  days: number
}

export default function SearchTrendsChart({ days }: SearchTrendsChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['searchTrends', days],
    queryFn: () => jobSearchAnalyticsAPI.getSearchTrends(days)
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="h-80 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    )
  }

  if (!data?.success || !data.data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No trend data available for the selected period
      </div>
    )
  }

  const trends = data.data

  const categories = trends.map((t) => new Date(t.date).toLocaleDateString())
  const searchCounts = trends.map((t) => Number(t.searchCount))
  const uniqueSessions = trends.map((t) => Number(t.uniqueSessions))

  const chartOptions = {
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      title: {
        text: 'Count'
      }
    },
    legend: {
      position: 'top' as const
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    colors: ['#3B82F6', '#10B981'],
    tooltip: {
      shared: true,
      intersect: false
    }
  }

  const series = [
    {
      name: 'Total Searches',
      data: searchCounts
    },
    {
      name: 'Unique Sessions',
      data: uniqueSessions
    }
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Search Trends Over Time
      </h3>
      <ApexChart options={chartOptions} series={series} type="area" height={350} />
    </div>
  )
}
