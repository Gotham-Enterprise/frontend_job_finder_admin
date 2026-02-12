'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getFlaggedContent, moderateContent, deleteContent } from '@/services/api/forumModerationApi'
import type { FlaggedContent, PaginationMeta } from '@/services/api/forumModerationApi'
import { ExternalLink, Check, X, Trash2, FileText } from 'lucide-react'
import ViewContentModal from './ViewContentModal'
import DeleteContentModal from './DeleteContentModal'

interface FlaggedContentTabProps {
  onStatsUpdate: () => void
}

export default function FlaggedContentTab({ onStatsUpdate }: FlaggedContentTabProps) {
  const [content, setContent] = useState<FlaggedContent[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'question' | 'answer' | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewContentItem, setViewContentItem] = useState<FlaggedContent | null>(null)
  const [showViewContentModal, setShowViewContentModal] = useState(false)
  const [deleteContentItem, setDeleteContentItem] = useState<FlaggedContent | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    loadContent()
  }, [typeFilter, currentPage])

  const loadContent = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoading(true)
      const params: any = { page: currentPage, limit: 20 }
      if (typeFilter !== 'all') params.type = typeFilter

      const data = await getFlaggedContent(token, params)
      setContent(data.content)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load flagged content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModerate = async (item: FlaggedContent, action: 'approve' | 'reject') => {
    const token = authUtils.getToken()
    if (!token) return
    if (!confirm(`Are you sure you want to ${action} this ${item.type}?`)) return
    try {
      await moderateContent(token, item.type, item.id, { action })
      loadContent()
      onStatsUpdate()
    } catch (error) {
      console.error(`Failed to ${action} content:`, error)
      alert(`Failed to ${action} content`)
    }
  }

  const handleDelete = async (item: FlaggedContent) => {
    setDeleteContentItem(item)
    setShowDeleteModal(true)
  }

  const handleDeleteSubmit = async (reason?: string) => {
    const token = authUtils.getToken()
    if (!token || !deleteContentItem) return
    try {
      await deleteContent(token, deleteContentItem.type, deleteContentItem.id, reason)
      setShowDeleteModal(false)
      setDeleteContentItem(null)
      loadContent()
      onStatsUpdate()
    } catch (error) {
      console.error('Failed to delete content:', error)
      throw error
    }
  }

  const handleViewContent = (item: FlaggedContent) => {
    setViewContentItem(item)
    setShowViewContentModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>

  return (
    <>
      <style jsx>{`
        .flagged-content-html * {
          max-width: 100% !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        .flagged-content-html table {
          display: block !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
          max-width: 100% !important;
        }
        .flagged-content-html pre,
        .flagged-content-html code {
          display: block !important;
          overflow-x: auto !important;
          white-space: pre-wrap !important;
          word-break: break-all !important;
          max-width: 100% !important;
        }
        .flagged-content-html img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      <div className="w-full max-w-full overflow-x-hidden box-border">
        <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1) }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="question">Questions</option>
          <option value="answer">Answers</option>
        </select>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No flagged content found.</div>
      ) : (
        <div className="w-full max-w-full box-border">
          <div className="space-y-4 w-full box-border">
            {content.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full max-w-full overflow-hidden box-border">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 w-full max-w-full box-border">
                  <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden box-border">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                        item.type === 'question' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 break-words">
                        {item.flagCount} reports • by {item.user.displayName}
                      </span>
                    </div>
                    {item.title && <h3 className="font-semibold text-gray-900 dark:text-white mb-2 break-words overflow-hidden">{item.title}</h3>}
                    <div className="w-full max-w-full overflow-x-auto box-border">
                      <div 
                        className="flagged-content-html text-sm text-gray-600 dark:text-gray-400 max-h-[4.5rem] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <button
                        onClick={() => handleViewContent(item)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="break-words">View Full Content</span>
                      </button>
                      {item.question && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${item.question.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline inline-flex items-center gap-1 break-all"
                        >
                          View on Forum <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 flex-wrap lg:min-w-[120px]">
                    {item.moderationStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleModerate(item, 'approve')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1 justify-center w-full lg:w-auto"
                        >
                          <Check className="w-4 h-4" /> <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleModerate(item, 'reject')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1 justify-center w-full lg:w-auto"
                        >
                          <X className="w-4 h-4" /> <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-1 justify-center w-full lg:w-auto"
                    >
                      <Trash2 className="w-4 h-4" /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 w-full max-w-full">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Content Modal */}
      {showViewContentModal && (
        <ViewContentModal
          content={viewContentItem}
          onClose={() => {
            setShowViewContentModal(false)
            setViewContentItem(null)
          }}
        />
      )}

      {/* Delete Content Modal */}
      {showDeleteModal && deleteContentItem && (
        <DeleteContentModal
          content={deleteContentItem}
          onClose={() => {
            setShowDeleteModal(false)
            setDeleteContentItem(null)
          }}
          onDelete={handleDeleteSubmit}
        />
      )}
      </div>
    </>
  )
}
