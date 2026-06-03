'use client'

import React, { useState, useRef } from 'react'
import { autoUpdate, flip, FloatingPortal, offset, shift, useFloating } from '@floating-ui/react'
import { Plus, Pencil, Trash2, Globe, Eye, Search, ArrowUpDown, ChevronDown, Info, MousePointerClick } from 'lucide-react'
import { useSurveyJobs, useToggleSurveyJob, useDeleteSurveyJob } from '@/services/hooks/useSurveyJobs'
import { SurveyJobSortBy } from '@/services/api/surveyJobs'
import type { SurveyJob } from '@/services/api/surveyJobs'
import Pagination from '@/components/tables/Pagination'
import CreateSurveyJobModal from './CreateSurveyJobModal'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import { formatDate } from '@/services/utils/dateUtils'

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

const SORT_OPTIONS: { value: SurveyJobSortBy; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'views_desc', label: 'Views: High → Low' },
  { value: 'views_asc', label: 'Views: Low → High' },
  { value: 'clicks_desc', label: 'Clicks: High → Low' },
  { value: 'clicks_asc', label: 'Clicks: Low → High' },
]

const CLICK_COUNT_TOOLTIP =
  'Count of users who clicked the job and were redirected to the affiliate partner\'s site.'

const PAGE_SIZE = 15

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function ClickCountHeaderLabel() {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: open ? autoUpdate : undefined,
  })

  return (
    <span className="inline-flex items-center justify-end gap-1">
      Click Count
      <button
        type="button"
        ref={refs.setReference}
        className="inline-flex cursor-help rounded text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:text-gray-300"
        aria-label={CLICK_COUNT_TOOLTIP}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            role="tooltip"
            style={floatingStyles}
            className="z-[9999] w-56 rounded-md bg-gray-900 px-2.5 py-2 text-left text-xs font-normal text-white shadow-lg dark:bg-gray-700"
          >
            {CLICK_COUNT_TOOLTIP}
          </div>
        </FloatingPortal>
      )}
    </span>
  )
}

export default function SurveyJobsTab() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<SurveyJob | null>(null)
  const [jobToDelete, setJobToDelete] = useState<SurveyJob | null>(null)

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [locationState, setLocationState] = useState('')
  const [cityInput, setCityInput] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [sortBy, setSortBy] = useState<SurveyJobSortBy>('date_desc')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce title/ID search
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value.trim())
      setPage(1)
    }, 300)
  }

  // Debounce city input
  const handleCityInputChange = (value: string) => {
    setCityInput(value)
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current)
    cityDebounceRef.current = setTimeout(() => {
      setLocationCity(value.trim())
      setPage(1)
    }, 300)
  }

  // Reset city when state changes
  const handleStateChange = (state: string) => {
    setLocationState(state)
    setCityInput('')
    setLocationCity('')
    setPage(1)
  }

  const handleSortChange = (value: SurveyJobSortBy) => {
    setSortBy(value)
    setPage(1)
  }

  const { data, isLoading, isError } = useSurveyJobs({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    locationState: locationState || undefined,
    locationCity: locationCity || undefined,
    sortBy,
  })

  const toggleMutation = useToggleSurveyJob()
  const deleteMutation = useDeleteSurveyJob()

  const handleAdd = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleEdit = (job: SurveyJob) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleToggle = (job: SurveyJob) => {
    toggleMutation.mutate({ id: job.id, isPublished: !job.isPublished })
  }

  const handleDelete = (job: SurveyJob) => {
    setJobToDelete(job)
  }

  const handleConfirmDelete = () => {
    if (!jobToDelete) return
    deleteMutation.mutate(jobToDelete.id, {
      onSettled: () => setJobToDelete(null),
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingJob(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Survey Jobs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manually posted opportunities via Survey Junkie
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Survey Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title or Job ID…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* State filter */}
        <div className="relative">
          <select
            value={locationState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
          >
            <option value="">All States</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* City filter */}
        <div className="relative">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => handleCityInputChange(e.target.value)}
            disabled={!locationState}
            placeholder={locationState ? 'Filter by city…' : 'Select state first'}
            className="pl-3 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed w-44"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SurveyJobSortBy)}
            className="appearance-none pl-8 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          Failed to load survey jobs. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Globe className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No survey jobs found</p>
          <p className="text-xs mt-1">
            {search || locationState ? 'Try adjusting your filters.' : 'Click "Add Survey Job" to create the first one.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Occupation
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Work Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Expiration Date
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Views
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    <ClickCountHeaderLabel />
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Published
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.data.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-xs truncate">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {[job.locationCity, job.locationState].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {job.occupation?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {job.workType ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={
                          isExpired(job.expiresAt)
                            ? 'text-red-600 dark:text-red-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        {formatDate(job.expiresAt, '—')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-sm">{(job.viewsCount ?? 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span className="text-sm">{(job.clicksCount ?? 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(job)}
                        disabled={toggleMutation.isPending}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                          job.isPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        } disabled:opacity-50`}
                        title={job.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            job.isPublished ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(job)}
                          title="Edit"
                          className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          title="Delete"
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, data.pagination.total)} of{' '}
                {data.pagination.total.toLocaleString()} jobs
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

      {/* Modal */}
      <CreateSurveyJobModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        job={editingJob}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setJobToDelete(null)}
        title="Delete Survey Job"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
