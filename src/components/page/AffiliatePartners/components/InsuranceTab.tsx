'use client'

import React, { useState, useMemo } from 'react'
import {
  useInsuranceSubmissions,
  useInsuranceRedirects,
} from '@/services/hooks/useInsurance'
import type {
  InsuranceSubmissionRecord,
  InsuranceRedirectRecord,
  InsuranceType,
  InsuranceFormType,
} from '@/services/api/insurance'
import {
  ExternalLink,
  FileText,
  MousePointerClick,
} from 'lucide-react'
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
  const offsetMinutes = new Date().getTimezoneOffset()
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

function formatUserLabel(user: { email: string; firstName: string | null; lastName: string | null } | null): string {
  if (!user) return '—'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return name ? `${name} (${user.email})` : user.email
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ViewType = 'submissions' | 'redirects'

const INSURANCE_TYPE_OPTIONS: { value: InsuranceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'MALPRACTICE', label: 'Malpractice' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'LIFE', label: 'Life' },
]

const PARTNER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Partners' },
  { value: 'cmf-group', label: 'CM&F Group' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsuranceTab() {
  const [view, setView] = useState<ViewType>('submissions')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [partnerSlug, setPartnerSlug] = useState('all')
  const [insuranceType, setInsuranceType] = useState<InsuranceType | 'all'>('all')
  const [formTypeFilter, setFormTypeFilter] = useState<InsuranceFormType | 'all'>('all')
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local')
  const [startDate, setStartDate] = useState(getFirstOfMonth())
  const [endDate, setEndDate] = useState(getTodayDate())

  const offsetSuffix = timezone === 'utc' ? '+00:00' : getLocalOffsetSuffix()

  const submissionParams = useMemo(
    () => ({
      page,
      limit,
      partnerSlug: partnerSlug !== 'all' ? partnerSlug : undefined,
      insuranceType: insuranceType !== 'all' ? insuranceType : undefined,
      formType: formTypeFilter !== 'all' ? formTypeFilter : undefined,
      startDate: formatDateWithOffset(startDate, 'start', offsetSuffix),
      endDate: formatDateWithOffset(endDate, 'end', offsetSuffix),
    }),
    [page, limit, partnerSlug, insuranceType, formTypeFilter, startDate, endDate, offsetSuffix]
  )

  const redirectParams = useMemo(
    () => ({
      page,
      limit,
      partnerSlug: partnerSlug !== 'all' ? partnerSlug : undefined,
      insuranceType: insuranceType !== 'all' ? insuranceType : undefined,
      startDate: formatDateWithOffset(startDate, 'start', offsetSuffix),
      endDate: formatDateWithOffset(endDate, 'end', offsetSuffix),
    }),
    [page, limit, partnerSlug, insuranceType, startDate, endDate, offsetSuffix]
  )

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    isError: submissionsError,
  } = useInsuranceSubmissions(submissionParams, { enabled: view === 'submissions' })

  const {
    data: redirectsData,
    isLoading: redirectsLoading,
    isError: redirectsError,
  } = useInsuranceRedirects(redirectParams, { enabled: view === 'redirects' })

  const isLoading = view === 'submissions' ? submissionsLoading : redirectsLoading
  const isError = view === 'submissions' ? submissionsError : redirectsError
  const data = view === 'submissions' ? submissionsData : redirectsData

  const handleViewChange = (nextView: ViewType) => {
    setView(nextView)
    setPage(1)
  }

  const handlePartnerChange = (value: string) => {
    setPartnerSlug(value)
    setPage(1)
  }

  const handleInsuranceTypeChange = (value: InsuranceType | 'all') => {
    setInsuranceType(value)
    setPage(1)
  }

  const handleFormTypeChange = (value: InsuranceFormType | 'all') => {
    setFormTypeFilter(value)
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
      {/* View toggle */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data Type</label>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden h-10 w-fit">
          <button
            onClick={() => handleViewChange('submissions')}
            className={`flex items-center gap-2 px-4 text-sm font-medium transition-colors ${
              view === 'submissions'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Submissions
          </button>
          <button
            onClick={() => handleViewChange('redirects')}
            className={`flex items-center gap-2 px-4 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
              view === 'redirects'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Redirects
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Partner</label>
          <select
            value={partnerSlug}
            onChange={(e) => handlePartnerChange(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PARTNER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Insurance Type</label>
          <select
            value={insuranceType}
            onChange={(e) => handleInsuranceTypeChange(e.target.value as InsuranceType | 'all')}
            className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {INSURANCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {view === 'submissions' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Form Type</label>
            <select
              value={formTypeFilter}
              onChange={(e) => handleFormTypeChange(e.target.value as InsuranceFormType | 'all')}
              className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Form Types</option>
              <option value="PL_INDIVIDUAL">Individual</option>
              <option value="PL_GROUP">Group</option>
            </select>
          </div>
        )}

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

        <div className="flex flex-col gap-1">
          <DatePicker
            key={`insurance-start-${startDate}`}
            id="insurance-start-date"
            label="Start Date"
            placeholder="Select start date"
            mode="single"
            defaultDate={startDate}
            onChange={handleStartDateChange as any}
          />
        </div>

        <div className="flex flex-col gap-1">
          <DatePicker
            key={`insurance-end-${endDate}`}
            id="insurance-end-date"
            label="End Date"
            placeholder="Select end date"
            mode="single"
            defaultDate={endDate}
            onChange={handleEndDateChange as any}
          />
        </div>
      </div>

      {view === 'redirects' && redirectsData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:max-w-xs gap-4">
            <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-400">Total Redirects</span>
              </div>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {redirectsData.summary.total.toLocaleString()}
              </p>
            </div>
          </div>

          {(redirectsData.summary.byPartner.length > 0 ||
            redirectsData.summary.byInsuranceType.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redirectsData.summary.byPartner.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">By Partner</h3>
                  <ul className="space-y-2">
                    {redirectsData.summary.byPartner.map((row) => (
                      <li
                        key={row.partnerSlug}
                        className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span>{formatEnumLabel(row.partnerSlug.replace(/-/g, '_'))}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {redirectsData.summary.byInsuranceType.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">By Insurance Type</h3>
                  <ul className="space-y-2">
                    {redirectsData.summary.byInsuranceType.map((row) => (
                      <li
                        key={row.insuranceType}
                        className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span>{formatEnumLabel(row.insuranceType)}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400 text-sm">
          Failed to load insurance {view}. Please try again.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            {view === 'submissions' ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Partner</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Insurance Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Form Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Form ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {submissionsData?.records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No submission records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    submissionsData?.records.map((record: InsuranceSubmissionRecord) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatEnumLabel(record.partnerSlug.replace(/-/g, '_'))}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatEnumLabel(record.insuranceType)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatEnumLabel(record.formType)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs whitespace-nowrap">
                          {record.formId.slice(0, 12)}…
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                          {formatUserLabel(record.user)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                          {formatDateDisplay(record.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Partner</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Insurance Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Redirected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {redirectsData?.records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No redirect records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    redirectsData?.records.map((record: InsuranceRedirectRecord) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatEnumLabel(record.partnerSlug.replace(/-/g, '_'))}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatEnumLabel(record.insuranceType)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                          {formatUserLabel(record.user)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                          {formatDateDisplay(record.redirectedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

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
