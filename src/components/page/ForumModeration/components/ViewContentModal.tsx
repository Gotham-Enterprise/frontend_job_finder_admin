'use client'

import React from 'react'
import type { ReportItem, FlaggedContent } from '@/services/api/forumModerationApi'
import { X, ExternalLink } from 'lucide-react'

interface ViewContentModalProps {
  content: ReportItem | FlaggedContent | null
  onClose: () => void
}

export default function ViewContentModal({ content, onClose }: ViewContentModalProps) {
  if (!content) return null

  const isReport = 'targetType' in content
  const contentType = isReport 
    ? (content as ReportItem).targetType 
    : (content as FlaggedContent).type

  const getContentText = () => {
    if (isReport) {
      const report = content as ReportItem
      if (report.question?.content) {
        return report.question.content
      }
      if (report.answer?.content) {
        return report.answer.content
      }
      return null
    } else {
      const flagged = content as FlaggedContent
      return flagged.content
    }
  }

  const getTitle = () => {
    if (isReport) {
      const report = content as ReportItem
      if (report.question) {
        return report.question.title
      }
      if (report.answer) {
        return `Answer to: ${report.answer.question.title}`
      }
    } else {
      const flagged = content as FlaggedContent
      return flagged.title || `${flagged.type.charAt(0).toUpperCase() + flagged.type.slice(1)} Content`
    }
    return 'Content'
  }

  const getLink = () => {
    if (isReport) {
      const report = content as ReportItem
      if (report.question) {
        return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.question.slug}`
      }
      if (report.answer) {
        return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${report.answer.question.slug}`
      }
    } else {
      const flagged = content as FlaggedContent
      if (flagged.question) {
        return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forum/questions/${flagged.question.slug}`
      }
    }
    return null
  }

  const contentText = getContentText()
  const title = getTitle()
  const link = getLink()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                contentType === 'question'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {contentType}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {contentText ? (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: contentText }}
            />
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              Content not available. Please view the full content on the forum.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Content on Forum
            </a>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
