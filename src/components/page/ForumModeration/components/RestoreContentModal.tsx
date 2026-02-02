'use client'

import React from 'react'
import { X, RotateCcw } from 'lucide-react'

interface RestoreContentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  contentType: string
  contentTitle?: string
  isRestoring: boolean
}

export default function RestoreContentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contentType,
  contentTitle,
  isRestoring 
}: RestoreContentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Restore Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isRestoring}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to restore this {contentType}?
          </p>
          {contentTitle && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {contentTitle}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This content will be visible again to all users and the deletion will be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isRestoring}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRestoring}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            {isRestoring ? 'Restoring...' : 'Restore Content'}
          </button>
        </div>
      </div>
    </div>
  )
}
