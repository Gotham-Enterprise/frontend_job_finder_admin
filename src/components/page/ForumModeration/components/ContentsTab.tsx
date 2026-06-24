'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getForumContent, moderateContent, deleteContent } from '@/services/api/forumModerationApi'
import type { ForumContentItem, PaginationMeta } from '@/services/api/forumModerationApi'
import { ExternalLink, Check, X, Trash2, FileText, Search, Filter } from 'lucide-react'
import Pagination from '@/components/tables/Pagination'
import ViewContentModal from './ViewContentModal'
import DeleteContentModal from './DeleteContentModal'

interface ContentsTabProps {
  onStatsUpdate: () => void
}

export default function ContentsTab({ onStatsUpdate }: ContentsTabProps) {
  const [content, setContent] = useState<ForumContentItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'question' | 'answer'>('question')
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'views'>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [viewContentItem, setViewContentItem] = useState<ForumContentItem | null>(null)
  const [showViewContentModal, setShowViewContentModal] = useState(false)
  const [deleteContentItem, setDeleteContentItem] = useState<ForumContentItem | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const limit = 20

  useEffect(() => {
    loadContent()
  }, [typeFilter, sortBy, currentPage, searchQuery])

  const loadContent = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoading(true)
      const params: any = { 
        type: typeFilter,
        sortBy,
        page: currentPage, 
        limit,
        search: searchQuery.trim() || undefined
      }

      const data = await getForumContent(token, params)
      setContent(data.content)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleModerate = async (item: ForumContentItem, action: 'approve' | 'reject') => {
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

  const handleDelete = async (item: ForumContentItem) => {
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

  const handleViewContent = (item: ForumContentItem) => {
    setViewContentItem(item)
    setShowViewContentModal(true)
  }

  const getContentUrl = (item: ForumContentItem) => {
    if (item.type === 'question' && item.slug) {
      return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${item.slug}`
    } else if (item.type === 'answer' && item.question) {
      return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${item.question.slug}#answer-${item.id}`
    }
    return null
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (isLoading && content.length === 0) return <div className="text-center py-8">Loading...</div>

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden box-border">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search ${typeFilter === 'question' ? 'questions' : 'answers'}...`}
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1) }}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="question">Questions</option>
              <option value="answer">Answers</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1) }}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="upvotes">Most Upvoted</option>
              {typeFilter === 'question' && <option value="views">Most Viewed</option>}
            </select>
          </div>
        </div>

        {/* Content Table */}
        {content.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'No content found matching your search.' : 'No content found.'}
          </div>
        ) : (
          <div className="w-full max-w-full box-border overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                    {typeFilter === 'question' ? 'Title' : 'Content'}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Author</th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">Views</th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">Upvotes</th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">Downvotes</th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3 max-w-md">
                      <div className="max-w-md break-words overflow-hidden">
                        {item.type === 'question' ? (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1 break-words overflow-wrap-anywhere">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                              {truncateText(stripHtml(item.content), 100)}
                            </p>
                            {item.topic && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                                {item.topic.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white mb-1 break-words">
                              {truncateText(stripHtml(item.content), 150)}
                            </p>
                            {item.question && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                                Re: {truncateText(item.question.title, 60)}
                              </p>
                            )}
                            {item.isAccepted && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                                ✓ Accepted
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.user.displayName}
                      </div>
                    </td>
                    <td className="p-3 text-center text-gray-900 dark:text-white">
                      {item.viewCount !== null ? item.viewCount : 'N/A'}
                    </td>
                    <td className="p-3 text-center text-green-600 dark:text-green-400 font-medium">
                      {item.upvotes}
                    </td>
                    <td className="p-3 text-center text-red-600 dark:text-red-400 font-medium">
                      {item.downvotes}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewContent(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {getContentUrl(item) && (
                          <a
                            href={getContentUrl(item)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="View on Forum"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {item.moderationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleModerate(item, 'approve')}
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleModerate(item, 'reject')}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, pagination.totalCount)} of{' '}
              {pagination.totalCount.toLocaleString()} items
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showViewContentModal && viewContentItem && (
        <ViewContentModal
          content={{
            id: viewContentItem.id,
            type: viewContentItem.type,
            title: viewContentItem.title,
            content: viewContentItem.content,
            moderationStatus: viewContentItem.moderationStatus,
            flagCount: 0,
            createdAt: viewContentItem.createdAt,
            user: viewContentItem.user,
            question: viewContentItem.question,
          } as any}
          onClose={() => {
            setShowViewContentModal(false)
            setViewContentItem(null)
          }}
        />
      )}

      {showDeleteModal && deleteContentItem && (
        <DeleteContentModal
          content={{
            id: deleteContentItem.id,
            type: deleteContentItem.type,
            title: deleteContentItem.title,
            content: deleteContentItem.content,
            moderationStatus: deleteContentItem.moderationStatus,
            flagCount: 0,
            createdAt: deleteContentItem.createdAt,
            user: deleteContentItem.user,
            question: deleteContentItem.question,
          } as any}
          onClose={() => {
            setShowDeleteModal(false)
            setDeleteContentItem(null)
          }}
          onDelete={handleDeleteSubmit}
        />
      )}
    </>
  )
}
