'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pageVisitAPI } from '@/services/pageVisitAPI'
import { PageVisitThreshold } from '@/types/page-visit'

interface Props {
  onAdd: () => void
  onEdit: (threshold: PageVisitThreshold) => void
}

export default function PageVisitThresholdsTable({ onAdd, onEdit }: Props) {
  const queryClient = useQueryClient()
  const [selectedPage, setSelectedPage] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['page-visit-thresholds'],
    queryFn: () => pageVisitAPI.getThresholds(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageVisitAPI.deleteThreshold(id),
    onSuccess: () => {
      alert('Threshold deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['page-visit-thresholds'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete threshold')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      pageVisitAPI.updateThreshold(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-visit-thresholds'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update threshold')
    },
  })

  const thresholds = data?.data || []
  const filteredThresholds = selectedPage
    ? thresholds.filter((t) => t.pageUrl.includes(selectedPage))
    : thresholds

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">
          Error loading thresholds: {(error as Error).message}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Page Visit Thresholds
          </h2>
          <input
            type="text"
            placeholder="Filter by page URL..."
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={onAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add Threshold
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Page URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Expected / Current
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Time Window
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Last Alert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Alerts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading thresholds...
                </td>
              </tr>
            ) : filteredThresholds.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No thresholds configured. Click "Add Threshold" to create one.
                </td>
              </tr>
            ) : (
              filteredThresholds.map((threshold) => (
                <tr key={threshold.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {threshold.pageUrl}
                      </span>
                      {threshold.pageUrl.includes('*') && (
                        <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          wildcard
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {threshold.expectedVisits}
                      </span>
                      <span className="text-sm text-gray-500">/</span>
                      <span
                        className={`text-sm font-semibold ${
                          threshold.isExceeding
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {threshold.currentCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {threshold.timeWindowHours}h
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: threshold.id,
                          enabled: !threshold.enabled,
                        })
                      }
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        threshold.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {threshold.enabled ? '✓ Enabled' : '✕ Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {threshold.lastAlertSent
                      ? new Date(threshold.lastAlertSent).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {threshold.alertsSentCount}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(threshold)}
                      className="mr-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this threshold?')) {
                          deleteMutation.mutate(threshold.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Thresholds</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {thresholds.length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Thresholds</p>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
            {thresholds.filter((t) => t.enabled).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exceeding Now</p>
          <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">
            {thresholds.filter((t) => t.isExceeding).length}
          </p>
        </div>
      </div>
    </div>
  )
}
