'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SurveyJob, CreateSurveyJobData } from '@/services/api/surveyJobs'
import { useCreateSurveyJob, useUpdateSurveyJob } from '@/services/hooks/useSurveyJobs'
import { useAffiliatePartners } from '@/services/hooks/useAffiliates'
import { apiGet } from '@/services/api/apiUtils'
import Select from '@/components/form/Select'
import RichTextEditor from '@/components/form/input/RichTextEditor'

// ─── Constants ────────────────────────────────────────────────────────────────

const MANUAL_SURVEY_PARTNER_NAMES = ['Survey Junkie', 'Sermo']

const SALARY_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
]

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  onClose: () => void
  job?: SurveyJob | null
}

// ─── Blank form state ─────────────────────────────────────────────────────────

function blankForm(affiliatePartnerId = ''): CreateSurveyJobData {
  return {
    affiliatePartnerId,
    title: '',
    jobDescription: '',
    occupationId: 0,
    workType: '',
    workSetting: '',
    workFacility: '',
    salaryType: 'yearly',
    salaryRangeStart: undefined,
    salaryRangeEnd: undefined,
    salaryCurrency: 'USD',
    locationCity: '',
    locationState: '',
    locationCountry: 'United States',
    locationZipCode: '',
    locationAddress: '',
    isPublished: true,
    datePosted: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateSurveyJobModal({ isOpen, onClose, job }: Props) {
  const isEdit = !!job

  const [form, setForm] = useState<CreateSurveyJobData>(blankForm())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: occupationsData, isLoading: loadingOccupations } = useQuery({
    queryKey: ['dropdowns', 'occupations'],
    queryFn: () => apiGet<{ success: boolean; data: { id: number; name: string }[] }>('/api/categories/occupations?page=1&limit=0&includeAll=true'),
    staleTime: 1000 * 60 * 60,
  })

  const { data: workTypesData } = useQuery({
    queryKey: ['dropdowns', 'workTypes'],
    queryFn: () => apiGet<{ data: { id: number; name: string }[] }>('/api/categories/workTypes'),
    staleTime: 1000 * 60 * 60,
  })

  const { data: workSettingsData } = useQuery({
    queryKey: ['dropdowns', 'workSettings'],
    queryFn: () => apiGet<{ data: { id: number; name: string }[] }>('/api/categories/workSettings'),
    staleTime: 1000 * 60 * 60,
  })

  const { data: workFacilitiesData } = useQuery({
    queryKey: ['dropdowns', 'workFacilities'],
    queryFn: () => apiGet<{ data: { id: number; name: string }[] }>('/api/categories/workFacilities'),
    staleTime: 1000 * 60 * 60,
  })

  const createMutation = useCreateSurveyJob()
  const updateMutation = useUpdateSurveyJob()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { data: partnersData, isLoading: loadingPartners } = useAffiliatePartners({
    limit: 100,
    status: 'active',
  })

  const surveyPartners = (partnersData?.data ?? []).filter(
    (p) => !p.syncEnabled && MANUAL_SURVEY_PARTNER_NAMES.includes(p.name)
  )

  const defaultPartnerId =
    surveyPartners.find((p) => p.name === 'Survey Junkie')?.id ??
    surveyPartners[0]?.id ??
    ''

  // ── Populate form when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (job) {
        setForm({
          affiliatePartnerId: job.affiliate?.id ?? '',
          title: job.title,
          jobDescription: job.jobDescription ?? '',
          occupationId: job.occupation?.id ?? 0,
          workType: job.workType ?? '',
          workSetting: job.workSetting ?? '',
          workFacility: job.workFacility ?? '',
          salaryType: job.salaryType,
          salaryRangeStart: job.salaryRangeStart || undefined,
          salaryRangeEnd: job.salaryRangeEnd || undefined,
          salaryCurrency: job.salaryCurrency,
          locationCity: job.locationCity ?? '',
          locationState: job.locationState ?? '',
          locationCountry: job.locationCountry ?? 'United States',
          locationZipCode: job.locationZipCode ?? '',
          locationAddress: job.locationAddress ?? '',
          isPublished: job.isPublished,
          datePosted: job.datePosted ? job.datePosted.split('T')[0] : new Date().toISOString().split('T')[0],
          expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : '',
        })
      } else {
        setForm(blankForm(defaultPartnerId))
      }
      setErrors({})
    }
  }, [isOpen, job, defaultPartnerId])

  // ── Field change ───────────────────────────────────────────────────────────
  const set = (field: keyof CreateSurveyJobData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!isEdit && !form.affiliatePartnerId) {
      errs.affiliatePartnerId = 'Affiliate partner is required'
    }
    if (!form.title.trim()) errs.title = 'Job title is required'
    if (!form.occupationId) errs.occupationId = 'Occupation is required'
    if (!form.locationCity.trim()) errs.locationCity = 'City is required'
    if (!form.locationState.trim()) errs.locationState = 'State is required'
    if (
      form.salaryRangeStart !== undefined &&
      form.salaryRangeEnd !== undefined &&
      form.salaryRangeEnd < form.salaryRangeStart
    ) {
      errs.salaryRangeEnd = 'Max salary must be ≥ min salary'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Strip empty optional strings to null
    const payload: CreateSurveyJobData = {
      ...form,
      workType: form.workType || undefined,
      workSetting: form.workSetting || undefined,
      workFacility: form.workFacility || undefined,
      locationZipCode: form.locationZipCode || undefined,
      locationAddress: form.locationAddress || undefined,
      jobDescription: form.jobDescription || undefined,
      datePosted: form.datePosted || undefined,
      expiresAt: form.expiresAt || undefined,
    }

    if (isEdit && job) {
      await updateMutation.mutateAsync({ id: job.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Survey Job' : 'Add Survey Job'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Affiliate Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Affiliate Partner {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {isEdit ? (
              <input
                type="text"
                value={job?.affiliate?.name ?? '—'}
                disabled
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            ) : (
              <Select
                placeholder={loadingPartners ? 'Loading…' : 'Select affiliate partner'}
                disabled={loadingPartners || surveyPartners.length === 0}
                value={form.affiliatePartnerId}
                options={surveyPartners.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                onChange={(val) => set('affiliatePartnerId', val)}
              />
            )}
            {errors.affiliatePartnerId && (
              <p className="text-red-500 text-xs mt-1">{errors.affiliatePartnerId}</p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Online Survey Taker"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Occupation <span className="text-red-500">*</span>
            </label>
            <Select
              searchable
              searchPlaceholder="Search occupations…"
              placeholder={loadingOccupations ? 'Loading…' : 'Select occupation'}
              disabled={loadingOccupations}
              value={form.occupationId ? String(form.occupationId) : ''}
              options={(occupationsData?.data ?? []).map((o) => ({
                value: String(o.id),
                label: o.name,
              }))}
              onChange={(val) => set('occupationId', parseInt(val, 10))}
            />
            {errors.occupationId && (
              <p className="text-red-500 text-xs mt-1">{errors.occupationId}</p>
            )}
          </div>

          {/* Work Type / Setting */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Type
              </label>
              <Select
                placeholder="Select type"
                value={form.workType ?? ''}
                options={(workTypesData?.data ?? []).map((t) => ({ value: t.name, label: t.name }))}
                onChange={(val) => set('workType', val)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Setting
              </label>
              <Select
                placeholder="Select setting"
                value={form.workSetting ?? ''}
                options={(workSettingsData?.data ?? []).map((s) => ({ value: s.name, label: s.name }))}
                onChange={(val) => set('workSetting', val)}
              />
            </div>
          </div>

          {/* Work Facility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Facility
            </label>
            <Select
              searchable
              searchPlaceholder="Search facilities..."
              placeholder="Select facility"
              value={form.workFacility ?? ''}
              options={(workFacilitiesData?.data ?? []).map((f) => ({ value: f.name, label: f.name }))}
              onChange={(val) => set('workFacility', val)}
            />
          </div>

          {/* Salary */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary Type
              </label>
              <select
                value={form.salaryType}
                onChange={(e) => set('salaryType', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SALARY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Salary
              </label>
              <input
                type="number"
                min={0}
                value={form.salaryRangeStart ?? ''}
                onChange={(e) =>
                  set('salaryRangeStart', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Salary
              </label>
              <input
                type="number"
                min={0}
                value={form.salaryRangeEnd ?? ''}
                onChange={(e) =>
                  set('salaryRangeEnd', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.salaryRangeEnd && (
                <p className="text-red-500 text-xs mt-1">{errors.salaryRangeEnd}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.locationCity}
                onChange={(e) => set('locationCity', e.target.value)}
                placeholder="e.g. New York"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.locationCity && (
                <p className="text-red-500 text-xs mt-1">{errors.locationCity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Select
                searchable
                searchPlaceholder="Search states…"
                placeholder="Select state"
                value={form.locationState}
                options={US_STATES.map((s) => ({ value: s, label: s }))}
                onChange={(val) => set('locationState', val)}
              />
              {errors.locationState && (
                <p className="text-red-500 text-xs mt-1">{errors.locationState}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={form.locationZipCode ?? ''}
                onChange={(e) => set('locationZipCode', e.target.value)}
                placeholder="e.g. 10001"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value="United States"
                disabled
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Date Posted / Expires At */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posting Date
              </label>
              <input
                type="date"
                value={form.datePosted ?? ''}
                onChange={(e) => set('datePosted', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={form.expiresAt ?? ''}
                onChange={(e) => set('expiresAt', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Description
            </label>
            <RichTextEditor
              content={form.jobDescription ?? ''}
              onChange={(value) => set('jobDescription', value)}
              placeholder="Enter Job Description"
              minHeight={250}
              hideImageButton={true}
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
