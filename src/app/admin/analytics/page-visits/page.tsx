'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageVisitThresholdsTable from '@/components/admin/page-analytics/PageVisitThresholdsTable'
import PageVisitStatistics from '@/components/admin/page-analytics/PageVisitStatistics'
import EmailRecipientsManager from '@/components/admin/page-analytics/EmailRecipientsManager'
import AddThresholdModal from '@/components/admin/page-analytics/AddThresholdModal'
import EditThresholdModal from '@/components/admin/page-analytics/EditThresholdModal'
import { PageVisitThreshold } from '@/types/page-visit'

export default function PageVisitsPage() {
  const [activeTab, setActiveTab] = useState<'thresholds' | 'statistics' | 'emails'>('thresholds')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingThreshold, setEditingThreshold] = useState<PageVisitThreshold | null>(null)

  const tabs = [
    { id: 'thresholds' as const, label: 'Thresholds', icon: '⚙️' },
    { id: 'statistics' as const, label: 'Statistics', icon: '📊' },
    { id: 'emails' as const, label: 'Email Recipients', icon: '✉️' }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Page Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor page visits, set thresholds, and receive alerts when pages exceed expected traffic
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'thresholds' && (
          <PageVisitThresholdsTable
            onAdd={() => setIsAddModalOpen(true)}
            onEdit={(threshold) => setEditingThreshold(threshold)}
          />
        )}
        
        {activeTab === 'statistics' && (
          <PageVisitStatistics />
        )}
        
        {activeTab === 'emails' && (
          <EmailRecipientsManager />
        )}
      </div>

      {/* Modals */}
      <AddThresholdModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {editingThreshold && (
        <EditThresholdModal
          threshold={editingThreshold}
          isOpen={!!editingThreshold}
          onClose={() => setEditingThreshold(null)}
        />
      )}
    </div>
  )
}
