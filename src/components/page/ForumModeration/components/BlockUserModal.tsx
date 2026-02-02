'use client'

import React, { useState } from 'react'
import { X, Shield } from 'lucide-react'

interface BlockUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userId: string, reason: string) => Promise<void>
  userId?: string // Optional pre-filled userId
}

export default function BlockUserModal({ isOpen, onClose, onSubmit, userId: initialUserId }: BlockUserModalProps) {
  const [userId, setUserId] = useState(initialUserId || '')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update userId when initialUserId changes
  React.useEffect(() => {
    if (initialUserId) {
      setUserId(initialUserId)
    }
  }, [initialUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim() || !reason.trim()) {
      alert('Please provide both User ID and reason')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(userId.trim(), reason.trim())
      setUserId('')
      setReason('')
      onClose()
    } catch (error) {
      console.error('Failed to block user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">Block Forum User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* User ID Input */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-2">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter forum user ID (e.g., clxyz123...)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary focus:border-transparent
                         dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                disabled={!!initialUserId}
                required
              />
              {!initialUserId && (
                <p className="mt-1 text-xs text-gray-500">
                  You can find the user ID from reports or forum profiles
                </p>
              )}
            </div>

            {/* Reason Input */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Block Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this user is being blocked (e.g., repeated spam, harassment, violation of community guidelines)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary focus:border-transparent
                         dark:bg-gray-700 dark:text-white resize-none"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This reason will be visible to the user and stored in moderation logs
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Blocking will prevent this user from posting questions, answers, 
                comments, and voting on the forum.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                       hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Blocking...' : 'Block User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
