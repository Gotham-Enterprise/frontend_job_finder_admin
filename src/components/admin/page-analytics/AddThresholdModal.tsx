'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pageVisitAPI } from '@/services/pageVisitAPI'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AddThresholdModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    pageUrl: '',
    expectedVisits: 100,
    timeWindowHours: 24,
    enabled: true,
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => pageVisitAPI.createThreshold(data),
    onSuccess: () => {
      alert('Threshold created successfully')
      queryClient.invalidateQueries({ queryKey: ['page-visit-thresholds'] })
      onClose()
      setFormData({ pageUrl: '', expectedVisits: 100, timeWindowHours: 24, enabled: true })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to create threshold')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Add New Threshold
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Page URL
            </label>
            <input
              type="text"
              value={formData.pageUrl}
              onChange={(e) => setFormData({ ...formData, pageUrl: e.target.value })}
              placeholder="/find-jobs or /jobs/*"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use * for wildcard matching (e.g., /jobs/*)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Visits
            </label>
            <input
              type="number"
              value={formData.expectedVisits}
              onChange={(e) => setFormData({ ...formData, expectedVisits: parseInt(e.target.value) })}
              min="1"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Window (hours)
            </label>
            <select
              value={formData.timeWindowHours}
              onChange={(e) => setFormData({ ...formData, timeWindowHours: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                <option key={hour} value={hour}>
                  {hour} hour{hour > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable immediately
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Threshold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
