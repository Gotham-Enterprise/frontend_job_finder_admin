'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pageVisitAPI } from '@/services/pageVisitAPI'

export default function SystemHealth() {
  const queryClient = useQueryClient()
  const [selectedRetention, setSelectedRetention] = useState(30)

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => pageVisitAPI.getSystemHealth(),
    refetchInterval: 5 * 60 * 1000, // 5 minutes instead of 30 seconds
  })

  const retentionMutation = useMutation({
    mutationFn: (days: number) => pageVisitAPI.updateRetentionPeriod(days),
    onSuccess: () => {
      alert('Retention period updated successfully')
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update retention period')
    },
  })

  const cleanupMutation = useMutation({
    mutationFn: () => pageVisitAPI.forceCleanup(),
    onSuccess: (data) => {
      alert(`Cleanup complete: ${data.data.entriesRemoved} entries removed`)
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Cleanup failed')
    },
  })

  const circuitResetMutation = useMutation({
    mutationFn: () => pageVisitAPI.resetCircuit(),
    onSuccess: () => {
      alert('Circuit breaker reset successfully')
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to reset circuit')
    },
  })

  const health = healthData?.data

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading system health...</div>
  }

  const getCircuitStatusColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'HALF_OPEN': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'OPEN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracks Today</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {health?.tracksToday?.toLocaleString() || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</p>
          <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">
            {health?.activeAlerts || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pages Tracked</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {health?.tracking?.pagesTracked || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries</p>
          <p className="mt-2 text-3xl font-semibold text-purple-600 dark:text-purple-400">
            {health?.tracking?.totalEntries?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          ⚡ Quick Actions
        </h3>
        <div className="space-y-4">
          {/* Adjust Retention */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Adjust Retention Period
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reduce retention to free up memory
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedRetention}
                onChange={(e) => setSelectedRetention(parseInt(e.target.value))}
                className="rounded border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {[7, 14, 21, 30].map((days) => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
              <button
                onClick={() => retentionMutation.mutate(selectedRetention)}
                disabled={retentionMutation.isPending}
                className="rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Force Cleanup */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Force Cleanup
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove expired visits and empty keys
              </p>
            </div>
            <button
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
              className="rounded bg-amber-600 px-4 py-1 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {cleanupMutation.isPending ? 'Cleaning...' : 'Run Cleanup'}
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Circuit Breaker Status
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCircuitStatusColor(health?.circuit?.state || 'CLOSED')}`}>
              {health?.circuit?.state || 'CLOSED'}
            </span>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Failures: {health?.circuit?.failures || 0}
            </p>
            {health?.circuit?.lastFailure && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last failure: {new Date(health.circuit.lastFailure).toLocaleString()}
              </p>
            )}
          </div>
          {health?.circuit?.state === 'OPEN' && (
            <button
              onClick={() => circuitResetMutation.mutate()}
              disabled={circuitResetMutation.isPending}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              Reset Circuit
            </button>
          )}
        </div>
        {health?.circuit?.state === 'OPEN' && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ Tracking is temporarily disabled due to backend issues. Click "Reset Circuit" to resume tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
