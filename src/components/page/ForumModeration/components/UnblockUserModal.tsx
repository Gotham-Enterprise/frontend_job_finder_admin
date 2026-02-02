'use client'

import React from 'react'
import { X, Unlock } from 'lucide-react'

interface UnblockUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  isUnblocking: boolean
}

export default function UnblockUserModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName,
  isUnblocking 
}: UnblockUserModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Unblock Forum User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isUnblocking}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to unblock <span className="font-semibold">{userName}</span>?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This user will be able to participate in the forum again.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isUnblocking}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isUnblocking}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock className="w-4 h-4" />
            {isUnblocking ? 'Unblocking...' : 'Unblock User'}
          </button>
        </div>
      </div>
    </div>
  )
}
