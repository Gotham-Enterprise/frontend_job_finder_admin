'use client'

import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useSurveyJobTrends } from '@/services/hooks/useSurveyJobs'
import type { Period, GroupBy } from '@/types/analytics'
import { buildCustomDateRange, formatDateForDisplay } from '@/utils/chartDateUtils'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface SurveyJobTrendsProps {
  affiliatePartnerId?: string
}

function getTickAmount(dataLength: number): number | undefined {
  if (dataLength <= 12) return undefined
  if (dataLength <= 31) return 7
  if (dataLength <= 52) return 12
  if (dataLength <= 180) return 12
  return 18
}

const PERIOD_LABELS: Record<Exclude<Period, 'custom'>, string> = {
  '24h': '24H',
  '7d': '7D',
  '28d': '1M',
  '3m': '3M',
  '6m': '6M',
  '9m': '9M',
  '1y': '1Y',
}

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

const GROUPBY_ELIGIBLE_PERIODS = new Set<Period>(['3m', '6m', '9m', '1y', 'custom'])

export default function SurveyJobTrends({ affiliatePartnerId }: SurveyJobTrendsProps) {
  const [period, setPeriod] = useState<Period>('3m')
  const [groupBy, setGroupBy] = useState<GroupBy>('monthly')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string | null
    endDate: string | null
  }>({ startDate: null, endDate: null })
  const datePickerRef = useRef<HTMLInputElement>(null)
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null)

  const showGroupBySelector = GROUPBY_ELIGIBLE_PERIODS.has(period)
  const effectiveGroupBy = showGroupBySelector ? groupBy : undefined

  const { data: response, isLoading, isError } = useSurveyJobTrends({
    period,
    groupBy: effectiveGroupBy,
    customDateRange: period === 'custom' ? customDateRange : undefined,
    affiliatePartnerId,
  })

  const categories = response?.data?.categories ?? []
  const clicksData = response?.data?.clicks?.data ?? []
  const viewsData = response?.data?.views?.data ?? []
  const totalClicks = response?.data?.clicks?.total ?? 0
  const totalViews = response?.data?.views?.total ?? 0

  const shouldRotateLabels = categories.length > 13

  const options: ApexOptions = useMemo(
    () => ({
      colors: ['#3b82f6', '#10B981'],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'area',
        height: 420,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      xaxis: {
        categories,
        tickAmount: getTickAmount(categories.length),
        labels: {
          rotate: -45,
          rotateAlways: shouldRotateLabels,
          hideOverlappingLabels: true,
          trim: false,
          style: {
            fontSize: categories.length > 52 ? '10px' : '11px',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: 'Outfit',
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      grid: {
        yaxis: {
          lines: {
            show: true,
          },
        },
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
      tooltip: {
        x: {
          show: false,
        },
        y: {
          formatter: (val: number) => `${val}`,
        },
      },
    }),
    [categories, shouldRotateLabels]
  )

  const series = useMemo(
    () => [
      { name: 'Clicks', data: clicksData },
      { name: 'Views', data: viewsData },
    ],
    [clicksData, viewsData]
  )

  useEffect(() => {
    if (datePickerRef.current && !flatpickrInstance.current) {
      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        mode: 'range',
        dateFormat: 'm-d-Y',
        maxDate: 'today',
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            const range = buildCustomDateRange(selectedDates[0], selectedDates[1])
            setCustomDateRange(range)
            setPeriod('custom')
          }
        },
        onClose: () => {
          setShowCustomDatePicker(false)
        },
        clickOpens: false,
      })
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy()
        flatpickrInstance.current = null
      }
    }
  }, [])

  const handleCustomDateClick = useCallback(() => {
    setShowCustomDatePicker(true)
    flatpickrInstance.current?.open()
  }, [])

  const handlePeriodClick = useCallback((p: Exclude<Period, 'custom'>) => {
    setPeriod(p)
    setCustomDateRange({ startDate: null, endDate: null })
  }, [])

  const handleGroupByClick = useCallback((g: GroupBy) => {
    setGroupBy(g)
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Survey Job Analytics
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total Clicks:{' '}
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {totalClicks.toLocaleString()}
          </span>
          <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
          Total Views:{' '}
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {totalViews.toLocaleString()}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="inline-flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl relative">
            {(Object.keys(PERIOD_LABELS) as Array<Exclude<Period, 'custom'>>).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodClick(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={handleCustomDateClick}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === 'custom'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Custom Date Range"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <input
                ref={datePickerRef}
                type="text"
                className="absolute top-0 left-0 opacity-0 pointer-events-none w-full h-full"
                placeholder="Select date range"
                readOnly
              />
            </div>
          </div>
          {period === 'custom' && customDateRange.startDate && customDateRange.endDate && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateForDisplay(customDateRange.startDate)} to{' '}
              {formatDateForDisplay(customDateRange.endDate)}
            </span>
          )}
        </div>

        {showGroupBySelector && (
          <div className="inline-flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {(Object.keys(GROUP_BY_LABELS) as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => handleGroupByClick(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  groupBy === g
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {GROUP_BY_LABELS[g]}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[420px]">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-[420px] text-sm text-red-600 dark:text-red-400">
          Failed to load survey job analytics. Please try again.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar [scrollbar-gutter:stable]">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={420}
            />
          </div>
        </div>
      )}
    </div>
  )
}
