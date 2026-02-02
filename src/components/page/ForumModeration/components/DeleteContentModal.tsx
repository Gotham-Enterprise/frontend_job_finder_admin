'use client'

import React, { useState } from 'react'
import type { FlaggedContent } from '@/services/api/forumModerationApi'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteContentModalProps {
  content: FlaggedContent
  onClose: () => void
  onDelete: (reason?: string) => Promise<void>
}

export default function DeleteContentModal({ content, onClose, onDelete }: DeleteContentModalProps) {
  const [reason, setReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    try {
      setError('')
      setIsDeleting(true)
      await onDelete(reason || undefined)
      onClose()
    } catch (err) {
      setError('Failed to delete content. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  Warning: This action cannot be undone
                </h3>
                <p className="text-sm text-red-800 dark:text-red-400">
                  You are about to permanently delete this {content.type}. This will remove it from the
                  database and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          {/* Content Details */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Type:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    content.type === 'question'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {content.type}
                </span>
              </div>
              {content.title && (
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Title:</span>
                  <span className="text-gray-900 dark:text-white flex-1">{content.title}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Author:</span>
                <span className="text-gray-900 dark:text-white">
                  {content.user.displayName} (@{content.user.user.username})
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Reports:</span>
                <span className="text-gray-900 dark:text-white">{content.flagCount} flag(s)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Status:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {content.moderationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {content.content && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content Preview</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div
                  className="text-sm text-gray-600 dark:text-gray-400 line-clamp-6"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            </div>
          )}

          {/* Deletion Reason */}
          <div>
            <label
              htmlFor="deleteReason"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Reason for Deletion (Optional)
            </label>
            <textarea
              id="deleteReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter a reason for deleting this content..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This reason will be logged in the moderation history.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}
