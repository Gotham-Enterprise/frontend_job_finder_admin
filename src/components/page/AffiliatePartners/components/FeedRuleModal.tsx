'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { AffiliatePartnerFeedRule, CreateFeedRuleData } from '@/services/api/affiliates'
import { apiGet } from '@/services/api/apiUtils'
import Select from '@/components/form/Select'
import SelectCity from '@/components/molecules/SelectCity'
import { US_STATES } from '@/constants/usStates'
import { US_STATE_CODE_TO_NAME } from '@/lib/useStatesCities'

const US_STATE_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATE_CODE_TO_NAME).map(([code, name]) => [name, code])
)

const EMPTY_FORM: CreateFeedRuleData = {
  ruleGroupLabel: '',
  occupationName: '',
  specialtyName: '',
  states: [],
  cities: [],
  workSetting: null,
  cpc: null,
  cpa: null,
  isActive: true,
}

interface FeedRuleModalProps {
  isOpen: boolean
  onClose: () => void
  rule: AffiliatePartnerFeedRule | null
  onSubmit: (data: CreateFeedRuleData) => void
  isSubmitting: boolean
}

export default function FeedRuleModal({
  isOpen,
  onClose,
  rule,
  onSubmit,
  isSubmitting,
}: FeedRuleModalProps) {
  const [form, setForm] = useState<CreateFeedRuleData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cityStateName, setCityStateName] = useState('')
  const [cityName, setCityName] = useState('')

  const { data: occupationsData, isLoading: loadingOccupations } = useQuery({
    queryKey: ['dropdowns', 'occupations'],
    queryFn: () =>
      apiGet<{ success: boolean; data: { id: number; name: string }[] }>(
        '/api/categories/occupations?page=1&limit=0&includeAll=true'
      ),
    enabled: isOpen,
  })

  const { data: workSettingsData, isLoading: loadingWorkSettings } = useQuery({
    queryKey: ['dropdowns', 'workSettings'],
    queryFn: () =>
      apiGet<{ success: boolean; data: { id: number; name: string }[] }>(
        '/api/categories/workSettings'
      ),
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  })

  useEffect(() => {
    if (rule) {
      setForm({
        ruleGroupLabel: rule.ruleGroupLabel || '',
        occupationName: rule.occupationName,
        specialtyName: rule.specialtyName || '',
        states: rule.states || [],
        cities: rule.cities || [],
        workSetting: rule.workSetting || null,
        cpc: rule.cpc ?? null,
        cpa: rule.cpa ?? null,
        isActive: rule.isActive,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setCityStateName('')
    setCityName('')
    setErrors({})
  }, [rule, isOpen])

  const cityStateCode = useMemo(
    () => (cityStateName ? US_STATE_NAME_TO_CODE[cityStateName] || '' : ''),
    [cityStateName]
  )

  if (!isOpen) return null

  const set = <K extends keyof CreateFeedRuleData>(key: K, value: CreateFeedRuleData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const toggleState = (state: string) => {
    set(
      'states',
      form.states?.includes(state)
        ? (form.states || []).filter((s) => s !== state)
        : [...(form.states || []), state]
    )
  }

  const addCity = () => {
    const city = cityName.trim()
    if (!city || !cityStateName) return
    const token = `${city}, ${cityStateName}`
    const existing = form.cities || []
    if (existing.some((entry) => entry.toLowerCase() === token.toLowerCase())) {
      setCityName('')
      return
    }
    set('cities', [...existing, token])
    setCityName('')
  }

  const removeCity = (token: string) => {
    set(
      'cities',
      (form.cities || []).filter((entry) => entry !== token)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.occupationName) errs.occupationName = 'Occupation is required'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const cities = [...(form.cities || [])]
    const pendingCity = cityName.trim()
    if (pendingCity && cityStateName) {
      const token = `${pendingCity}, ${cityStateName}`
      if (!cities.some((entry) => entry.toLowerCase() === token.toLowerCase())) {
        cities.push(token)
      }
    }
    onSubmit({
      ...form,
      ruleGroupLabel: form.ruleGroupLabel || undefined,
      specialtyName: form.specialtyName || null,
      cities,
      workSetting: form.workSetting || null,
      cpc: form.cpc === null || form.cpc === undefined || form.cpc === ('' as unknown as number)
        ? null
        : Number(form.cpc),
      cpa: form.cpa === null || form.cpa === undefined || form.cpa === ('' as unknown as number)
        ? null
        : Number(form.cpa),
    })
  }

  const occupationOptions = (occupationsData?.data ?? []).map((o) => ({
    value: o.name,
    label: o.name,
  }))

  const workSettingOptions = [
    { value: '', label: 'Any' },
    ...(workSettingsData?.data ?? []).map((ws) => ({
      value: ws.name,
      label: ws.name,
    })),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {rule ? 'Edit Feed Rule' : 'Add Feed Rule'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rule Label
              </label>
              <input
                type="text"
                value={form.ruleGroupLabel || ''}
                onChange={(e) => set('ruleGroupLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="e.g., Pain Management PAs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Occupation <span className="text-red-500">*</span>
              </label>
              <Select
                searchPlaceholder="Search occupations…"
                placeholder={loadingOccupations ? 'Loading…' : 'Select occupation'}
                value={form.occupationName || ''}
                options={occupationOptions}
                onChange={(val) => set('occupationName', val)}
              />
              {errors.occupationName && (
                <p className="text-red-500 text-xs mt-1">{errors.occupationName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={form.specialtyName || ''}
                onChange={(e) => set('specialtyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Optional — leave blank for any specialty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Setting
              </label>
              <Select
                searchable
                searchPlaceholder="Search work settings…"
                placeholder={loadingWorkSettings ? 'Loading…' : 'Any'}
                value={form.workSetting || ''}
                options={workSettingOptions}
                onChange={(val) => set('workSetting', val || null)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave as Any to match all work settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                States
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Leave all unchecked to match all states
              </p>
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                {US_STATES.map((state) => (
                  <label key={state} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.states?.includes(state) || false}
                      onChange={() => toggleState(state)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{state}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cities
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Optional. Leave empty to match all cities in the selected states
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={cityStateName}
                  onChange={(e) => {
                    setCityStateName(e.target.value)
                    setCityName('')
                  }}
                  className="sm:w-44 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div className="flex-1">
                  <SelectCity
                    value={cityName}
                    stateValue={cityStateCode}
                    onChange={setCityName}
                    inputClassName="!h-10"
                    placeholder={cityStateCode ? 'Search city' : 'Select a state first'}
                  />
                </div>
                <button
                  type="button"
                  onClick={addCity}
                  disabled={!cityStateName || !cityName.trim()}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {(form.cities || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(form.cities || []).map((token) => (
                    <span
                      key={token}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {token}
                      <button
                        type="button"
                        onClick={() => removeCity(token)}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        aria-label={`Remove ${token}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPC Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cpc ?? ''}
                  onChange={(e) =>
                    set('cpc', e.target.value === '' ? null : parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPA Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cpa ?? ''}
                  onChange={(e) =>
                    set('cpa', e.target.value === '' ? null : parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
