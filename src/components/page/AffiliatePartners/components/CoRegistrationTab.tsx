'use client'

import React, { useState, useMemo } from 'react'
import { useAdzunaCoRegs } from '@/services/hooks/useAffiliates'
import type { AdzunaCoRegRecord } from '@/services/api/affiliates'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Pagination from '@/components/tables/Pagination'
import DatePicker from '@/components/form/date-picker'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstOfMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

function getTodayDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getLocalOffsetSuffix(): string {
  const offsetMinutes = new Date().getTimezoneOffset() // positive = behind UTC
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const h = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  const mm = String(absMinutes % 60).padStart(2, '0')
  return `${sign}${h}:${mm}`
}

function getLocalOffsetLabel(): string {
  const offsetMinutes = new Date().getTimezoneOffset()
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const h = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  const mm = String(absMinutes % 60).padStart(2, '0')
  return `Local (GMT${sign}${h}:${mm})`
}

function formatDateWithOffset(dateStr: string, time: 'start' | 'end', offsetSuffix: string): string {
  const timeStr = time === 'start' ? 'T00:00:00' : 'T23:59:59'
  return `${dateStr}${timeStr}${offsetSuffix}`
}

function formatDateDisplay(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'success' | 'failed' }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" />
        Success
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="w-3 h-3" />
      Failed
    </span>
  )
}

const ERROR_TRUNCATE_LENGTH = 80

function ErrorCell({ message }: { message: string | null }) {
  const [expanded, setExpanded] = useState(false)

  if (!message) {
    return <span className="text-gray-400 dark:text-gray-600 text-xs">—</span>
  }

  const isLong = message.length > ERROR_TRUNCATE_LENGTH

  return (
    <div className="text-xs text-gray-700 dark:text-gray-300 max-w-xs">
      <span>{expanded || !isLong ? message : `${message.slice(0, ERROR_TRUNCATE_LENGTH)}...`}</span>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline font-medium whitespace-nowrap"
        >
          {expanded ? (
            <>
              See less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              See more <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoRegistrationTab() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local')
  const [startDate, setStartDate] = useState(getFirstOfMonth())
  const [endDate, setEndDate] = useState(getTodayDate())

  const offsetSuffix = timezone === 'utc' ? '+00:00' : getLocalOffsetSuffix()

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: formatDateWithOffset(startDate, 'start', offsetSuffix),
      endDate: formatDateWithOffset(endDate, 'end', offsetSuffix),
    }),
    [page, limit, statusFilter, startDate, endDate, offsetSuffix]
  )

  const { data, isLoading, isError } = useAdzunaCoRegs(queryParams)

  const handleStatusChange = (value: 'all' | 'success' | 'failed') => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleTimezoneChange = (value: 'local' | 'utc') => {
    setTimezone(value)
    setPage(1)
  }

  const handleStartDateChange = (selectedDates: Date[] | string[]) => {
    if (selectedDates?.length > 0) {
      const d = selectedDates[0]
      if (typeof d === 'string') {
        setStartDate(d)
      } else {
        const y = d.getFullYear()
        const mo = String(d.getMonth() + 1).padStart(2, '0')
        const dy = String(d.getDate()).padStart(2, '0')
        setStartDate(`${y}-${mo}-${dy}`)
      }
      setPage(1)
    }
  }

  const handleEndDateChange = (selectedDates: Date[] | string[]) => {
    if (selectedDates?.length > 0) {
      const d = selectedDates[0]
      if (typeof d === 'string') {
        setEndDate(d)
      } else {
        const y = d.getFullYear()
        const mo = String(d.getMonth() + 1).padStart(2, '0')
        const dy = String(d.getDate()).padStart(2, '0')
        setEndDate(`${y}-${mo}-${dy}`)
      }
      setPage(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as 'all' | 'success' | 'failed')}
            className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Timezone Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Timezone</label>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden h-10">
            <button
              onClick={() => handleTimezoneChange('local')}
              className={`px-3 text-sm font-medium transition-colors ${
                timezone === 'local'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {getLocalOffsetLabel()}
            </button>
            <button
              onClick={() => handleTimezoneChange('utc')}
              className={`px-3 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
                timezone === 'utc'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              UTC
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <DatePicker
            key={`coreg-start-${startDate}`}
            id="coreg-start-date"
            label="Start Date"
            placeholder="Select start date"
            mode="single"
            defaultDate={startDate}
            onChange={handleStartDateChange as any}
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1">
          <DatePicker
            key={`coreg-end-${endDate}`}
            id="coreg-end-date"
            label="End Date"
            placeholder="Select end date"
            mode="single"
            defaultDate={endDate}
            onChange={handleEndDateChange as any}
          />
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Total Success</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {data.summary.successCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Total Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {data.summary.failedCount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400 text-sm">
          Failed to load co-registration records. Please try again.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Occupation</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Response Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Attempts</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Error Reason</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {data?.records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No co-registration records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  data?.records.map((record: AdzunaCoRegRecord) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-mono text-xs whitespace-nowrap">
                        {record.email}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {record.what ?? <span className="text-gray-400 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {record.where ?? <span className="text-gray-400 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {record.responseCode != null ? (
                          <span
                            className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                              record.responseCode >= 200 && record.responseCode < 300
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {record.responseCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap text-center">
                        {record.attempts}
                      </td>
                      <td className="px-4 py-3">
                        <ErrorCell message={record.errorMessage} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                        {formatDateDisplay(record.sentAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, data.pagination.total)} of{' '}
                {data.pagination.total.toLocaleString()} records
              </p>
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
