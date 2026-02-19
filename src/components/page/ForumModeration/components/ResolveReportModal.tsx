'use client'

import React, { useState } from 'react'
import type { ReportItem } from '@/services/api/forumModerationApi'
import { X, Check, Ban, ExternalLink } from 'lucide-react'

interface ResolveReportModalProps {
  report: ReportItem
  onClose: () => void
  onResolve: (status: 'reviewed' | 'dismissed', note?: string) => Promise<void>
}

export default function ResolveReportModal({ report, onClose, onResolve }: ResolveReportModalProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (status: 'reviewed' | 'dismissed') => {
    try {
      setError('')
      setIsSubmitting(true)
      await onResolve(status, note || undefined)
    } catch (err) {
      setError('Failed to resolve report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Details */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Report Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Type:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  report.targetType === 'question' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {report.targetType}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Reason:</span>
                <span className="text-gray-900 dark:text-white capitalize">{report.reason}</span>
              </div>
              {report.description && (
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Details:</span>
                  <span className="text-gray-900 dark:text-white flex-1">{report.description}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Reporter:</span>
                <span className="text-gray-900 dark:text-white">
                  {report.reporter ? (
                    `${report.reporter.displayName} (@${report.reporter.user.username})`
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        🤖 AI System
                      </span>
                      {report.aiConfidenceScore && (
                        <span className="text-xs text-gray-500">
                          ({(report.aiConfidenceScore * 100).toFixed(1)}% confidence)
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Date:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Content Link */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Reported Content</h3>
            {report.question && (
              <a
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.question.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
              >
                {report.question.title}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {report.answer && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Answer to: {report.answer.question.title}
                </p>
                <a
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.answer.question.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  View Question
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resolution Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about your decision..."
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('dismissed')}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Dismiss
          </button>
          <button
            onClick={() => handleSubmit('reviewed')}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Resolve
          </button>
        </div>
      </div>
    </div>
  )
}
