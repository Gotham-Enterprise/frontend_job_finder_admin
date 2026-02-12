'use client'

import React, { useState, useEffect } from 'react'
import {
  useAffiliateBatches,
  useAffiliateBatchJobs,
  useReprocessAffiliateBatch,
} from '@/services/hooks/useAffiliates'
import type { AffiliateBatch } from '@/services/api/affiliates'
import { ChevronDown, ChevronRight, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Zap, Eye, EyeOff } from 'lucide-react'

export default function BatchesTab() {
  const [page, setPage] = useState(1)
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null)
  const [jobsPage, setJobsPage] = useState(1)
  const [allLoadedJobs, setAllLoadedJobs] = useState<any[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data: batchesData, isLoading } = useAffiliateBatches({ page, limit: 10 })
  const { data: jobsData, isLoading: isLoadingJobs } = useAffiliateBatchJobs(
    expandedBatchId || '',
    { page: jobsPage, limit: 20 }
  )
  
  const reprocessMutation = useReprocessAffiliateBatch()

  // Reset jobs when batch changes
  useEffect(() => {
    if (expandedBatchId) {
      setAllLoadedJobs([])
      setJobsPage(1)
    }
  }, [expandedBatchId])

  // Append new jobs when data loads
  useEffect(() => {
    if (jobsData && jobsData.data.length > 0) {
      setAllLoadedJobs(prev => {
        const existingIds = new Set(prev.map(job => job.id))
        const newJobs = jobsData.data.filter(job => !existingIds.has(job.id))
        return [...prev, ...newJobs]
      })
      setIsLoadingMore(false)
    }
  }, [jobsData])

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: Clock },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: RefreshCw },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
      partial: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: AlertTriangle },
    }
    const style = styles[status as keyof typeof styles] || styles.pending
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleReprocess = async (batchId: string) => {
    if (confirm('Are you sure you want to reprocess this batch? All existing jobs will be deleted and recreated.')) {
      await reprocessMutation.mutateAsync(batchId)
    }
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setJobsPage(prev => prev + 1)
  }

  const toggleExpand = (batchId: string) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null)
      setJobsPage(1)
      setAllLoadedJobs([])
    } else {
      setExpandedBatchId(batchId)
      setJobsPage(1)
      setAllLoadedJobs([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Batch History</h2>
      </div>

      {/* Batches Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                File / Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Jobs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
            {batchesData?.data.map((batch) => (
              <React.Fragment key={batch.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleExpand(batch.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {expandedBatchId === batch.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {batch.fileName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {batch.affiliate?.name || 'Unknown'} • v{batch.parserVersion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(batch.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="text-gray-900 dark:text-white">
                        {batch.processedJobs} / {batch.totalJobs}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {batch.duplicateJobs > 0 && <span className="text-yellow-600">⚠ {batch.duplicateJobs} dupes</span>}
                        {batch.failedJobs > 0 && <span className="text-red-600 ml-2">✗ {batch.failedJobs} failed</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(batch.uploadedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {batch.uploadedBy === null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                          <Zap className="w-3 h-3" />
                          Auto-Synced
                        </span>
                      )}
                      {batch.status === 'failed' || batch.status === 'partial' ? (
                        <button
                          onClick={() => handleReprocess(batch.id)}
                          disabled={reprocessMutation.isPending}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                          title="Reprocess batch"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>

                {/* Expanded Row - Jobs List */}
                {expandedBatchId === batch.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 dark:bg-gray-900/30">
                      <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                          Batch Jobs
                        </h3>
                        
                        {batch.errorLog && (
                          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
                              Error Log
                            </p>
                            <p className="text-xs text-red-800 dark:text-red-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {batch.errorLog}
                            </p>
                          </div>
                        )}

                        {isLoadingJobs && allLoadedJobs.length === 0 ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : allLoadedJobs.length > 0 ? (
                          <>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                              {allLoadedJobs.map((job) => (
                                <div
                                  key={job.id}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {job.title}
                                      </h4>
                                      {job.isPublished ? (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                          <Eye className="w-3 h-3" />
                                          Published
                                        </span>
                                      ) : (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded text-xs">
                                          <EyeOff className="w-3 h-3" />
                                          Unpublished
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {job.externalJobPostCompanyName} • {job.locationCity}, {job.locationState}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      Posted: {new Date(job.datePosted).toLocaleDateString()}
                                      {job.occupation && <> • {job.occupation.name}</>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Load More Button */}
                            {jobsData && jobsData.page < jobsData.totalPages && (
                              <div className="flex flex-col items-center gap-2 mt-4">
                                <button
                                  onClick={handleLoadMore}
                                  disabled={isLoadingMore}
                                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isLoadingMore ? (
                                    <span className="flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Loading...
                                    </span>
                                  ) : (
                                    `Load More (${allLoadedJobs.length} of ${jobsData.total})`
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {jobsData && jobsData.page >= jobsData.totalPages && (
                              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Showing all {allLoadedJobs.length} jobs
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No jobs found in this batch
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {batchesData?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No batches found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {batchesData && batchesData.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {batchesData.page} of {batchesData.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === batchesData.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
