'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getModerationLogs } from '@/services/api/forumModerationApi'
import type { ModerationLog, PaginationMeta } from '@/services/api/forumModerationApi'

export default function ModerationLogsTab() {
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionFilter, setActionFilter] = useState<string>('all')

  useEffect(() => {
    loadLogs()
  }, [currentPage, actionFilter])

  const loadLogs = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoading(true)
      const params: any = { page: currentPage, limit: 20 }
      if (actionFilter !== 'all') params.action = actionFilter

      const data = await getModerationLogs(token, params)
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load moderation logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>

  return (
    <>
      <div className="flex gap-4 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1) }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Actions</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="delete">Delete</option>
          <option value="block">Block</option>
          <option value="unblock">Unblock</option>
          <option value="resolve">Resolve</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No moderation logs found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-4 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.admin.username}</div>
                        {(log.admin.firstName || log.admin.lastName) && (
                          <div className="text-gray-500">
                            {log.admin.firstName} {log.admin.lastName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.action === 'approve' ? 'bg-green-100 text-green-800' :
                        log.action === 'reject' || log.action === 'block' ? 'bg-red-100 text-red-800' :
                        log.action === 'delete' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="capitalize">{log.targetType}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
