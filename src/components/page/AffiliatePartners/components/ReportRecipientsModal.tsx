'use client'

import React, { useState } from 'react'
import { X, Mail, Trash2, Plus, Loader2 } from 'lucide-react'
import {
  useReportRecipients,
  useAddReportRecipient,
  useRemoveReportRecipient,
} from '@/services/hooks/useAffiliates'

interface Props {
  isOpen: boolean
  onClose: () => void
  partnerId: string
  partnerName: string
}

export default function ReportRecipientsModal({ isOpen, onClose, partnerId, partnerName }: Props) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const { data: recipients = [], isLoading } = useReportRecipients(partnerId)
  const addMutation = useAddReportRecipient()
  const removeMutation = useRemoveReportRecipient()

  if (!isOpen) return null

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  const handleAdd = async () => {
    setEmailError('')
    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError('Email address is required.')
      return
    }
    if (!validateEmail(trimmed)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    await addMutation.mutateAsync({ partnerId, email: trimmed })
    setEmail('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Report Recipients</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{partnerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Each recipient will receive a separate daily email report for <strong>{partnerName}</strong> at 11 PM ET, containing End of Day, Week to Date, and Month to Date summaries.
          </p>

          {/* Add recipient form */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add Recipient
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={handleKeyDown}
                  placeholder="email@example.com"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors ${
                    emailError
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {addMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>
          </div>

          {/* Recipients list */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Recipients
              {recipients.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                  {recipients.length}
                </span>
              )}
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : recipients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700">
                <Mail className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No recipients yet.</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Add an email above to start receiving reports.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                {recipients.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      <span className="truncate text-sm text-gray-700 dark:text-gray-300">{r.email}</span>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate({ partnerId, recipientId: r.id })}
                      disabled={removeMutation.isPending && removeMutation.variables?.recipientId === r.id}
                      className="ml-3 shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                      title="Remove recipient"
                    >
                      {removeMutation.isPending && removeMutation.variables?.recipientId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
