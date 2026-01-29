'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getReports, resolveReport } from '@/services/api/forumModerationApi'
import type { ReportItem, PaginationMeta } from '@/services/api/forumModerationApi'
import { ExternalLink, Check, X, Eye, FileText } from 'lucide-react'
import ResolveReportModal from './ResolveReportModal'
import ViewContentModal from './ViewContentModal'

interface ReportsTabProps {
  onStatsUpdate: () => void
}

export default function ReportsTab({ onStatsUpdate }: ReportsTabProps) {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'dismissed' | 'all'>(
    'pending',
  )
  const [typeFilter, setTypeFilter] = useState<'question' | 'answer' | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [viewContentReport, setViewContentReport] = useState<ReportItem | null>(null)
  const [showViewContentModal, setShowViewContentModal] = useState(false)

  useEffect(() => {
    loadReports()
  }, [statusFilter, typeFilter, currentPage])

  const loadReports = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        limit: 20,
      }
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.targetType = typeFilter

      const data = await getReports(token, params)
      setReports(data.reports)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = (report: ReportItem) => {
    setSelectedReport(report)
    setShowResolveModal(true)
  }

  const handleViewContent = (report: ReportItem) => {
    setViewContentReport(report)
    setShowViewContentModal(true)
  }

  const handleResolveSubmit = async (status: 'reviewed' | 'dismissed', note?: string) => {
    const token = authUtils.getToken()
    if (!token || !selectedReport) return
    try {
      await resolveReport(token, selectedReport.id, { status, note })
      setShowResolveModal(false)
      setSelectedReport(null)
      loadReports()
      onStatsUpdate()
    } catch (error) {
      console.error('Failed to resolve report:', error)
      throw error
    }
  }

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      harassment: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      inappropriate:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      misinformation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[reason] || colors.other
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[status] || colors.pending
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading reports...</div>
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="question">Questions</option>
            <option value="answer">Answers</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reports found for the selected filters.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Reporter
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            report.targetType === 'question'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {report.targetType}
                        </span>
                        <div className="flex-1 min-w-0">
                          {report.question && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.question.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {report.question.title}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {report.answer && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Answer to: </span>
                              <a
                                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.answer.question.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {report.answer.question.title}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {report.reporter.displayName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          @{report.reporter.user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getReasonBadge(report.reason)}`}
                      >
                        {report.reason}
                      </span>
                      {report.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                          {report.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewContent(report)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Content
                        </button>
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleResolve(report)}
                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        )}
                        {report.status !== 'pending' && report.resolver && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            By {report.resolver.displayName}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total
                reports)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Resolve Report Modal */}
      {showResolveModal && selectedReport && (
        <ResolveReportModal
          report={selectedReport}
          onClose={() => {
            setShowResolveModal(false)
            setSelectedReport(null)
          }}
          onResolve={handleResolveSubmit}
        />
      )}

      {/* View Content Modal */}
      {showViewContentModal && (
        <ViewContentModal
          content={viewContentReport}
          onClose={() => {
            setShowViewContentModal(false)
            setViewContentReport(null)
          }}
        />
      )}
    </>
  )
}
