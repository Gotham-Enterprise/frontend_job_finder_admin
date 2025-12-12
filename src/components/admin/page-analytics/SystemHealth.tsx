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
    refetchInterval: 30000,
  })

  const { data: memoryData } = useQuery({
    queryKey: ['memory-stats'],
    queryFn: () => pageVisitAPI.getMemoryStats(),
    refetchInterval: 30000,
  })

  const retentionMutation = useMutation({
    mutationFn: (days: number) => pageVisitAPI.updateRetentionPeriod(days),
    onSuccess: () => {
      alert('Retention period updated successfully')
      queryClient.invalidateQueries({ queryKey: ['memory-stats'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update retention period')
    },
  })

  const cleanupMutation = useMutation({
    mutationFn: () => pageVisitAPI.forceCleanup(),
    onSuccess: (data) => {
      alert(`Cleanup complete: ${data.data.entriesRemoved} entries removed`)
      queryClient.invalidateQueries({ queryKey: ['memory-stats'] })
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
  const memory = memoryData?.data

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading system health...</div>
  }

  const getMemoryStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getCircuitStatusColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'HALF_OPEN': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'OPEN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const usagePercent = parseFloat(health?.memory?.health?.usagePercent || '0')

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

      {/* Redis Memory Panel */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Redis Memory Usage
          </h3>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getMemoryStatusColor(health?.memory?.health?.status || 'UNKNOWN')}`}>
            {health?.memory?.health?.status || 'UNKNOWN'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {health?.memory?.used_memory_human} / {health?.memory?.maxmemory_human}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-500 ${
                usagePercent < 70 ? 'bg-green-500' :
                usagePercent < 80 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory Stats Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Evicted Keys</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {health?.memory?.evicted_keys?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tracking Data</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {health?.tracking?.estimatedMB} MB
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Oldest Data</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {health?.oldestData ? new Date(health.oldestData).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Entries/Page</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {health?.tracking?.pagesTracked 
                ? Math.floor(health.tracking.totalEntries / health.tracking.pagesTracked)
                : 0}
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        {usagePercent > 80 && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              ⚠️ High Memory Usage Warning
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              Redis memory usage is above 80%. Take action to prevent data loss.
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {memory?.recommendations && memory.recommendations.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            📋 Recommendations
          </h3>
          <div className="space-y-3">
            {memory.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`rounded-lg border-l-4 p-4 ${
                  rec.priority === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  rec.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {rec.action}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {rec.description}
                    </p>
                    <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                      Impact: {rec.impact}
                    </p>
                  </div>
                  <span className={`ml-4 rounded-full px-2 py-1 text-xs font-medium ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
