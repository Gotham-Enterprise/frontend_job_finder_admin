'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getModerationStats } from '@/services/api/forumModerationApi'
import type { ModerationStats } from '@/services/api/forumModerationApi'
import { Shield, AlertTriangle, Flag, FileText, Users, Trash2 } from 'lucide-react'
import ReportsTab from './components/ReportsTab'
import FlaggedContentTab from './components/FlaggedContentTab'
import ModerationLogsTab from './components/ModerationLogsTab'
import AllUsersTab from './components/AllUsersTab'
import DeletedContentTab from './components/DeletedContentTab'

type TabType = 'reports' | 'flagged' | 'users' | 'deleted' | 'logs'

export default function ForumModeration() {
  const [activeTab, setActiveTab] = useState<TabType>('reports')
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoadingStats(true)
      const data = await getModerationStats(token)
      setStats(data)
    } catch (error) {
      console.error('Failed to load moderation stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const tabs = [
    {
      id: 'reports' as TabType,
      label: 'Reports',
      icon: Flag,
      count: stats?.pendingReports || 0,
    },
    {
      id: 'flagged' as TabType,
      label: 'Flagged Content',
      icon: AlertTriangle,
      count: stats?.flaggedContent || 0,
    },
    {
      id: 'users' as TabType,
      label: 'All Users',
      icon: Users,
      count: undefined,
    },
    {
      id: 'deleted' as TabType,
      label: 'Deleted Content',
      icon: Trash2,
      count: undefined,
    },
    {
      id: 'logs' as TabType,
      label: 'Moderation Logs',
      icon: FileText,
      count: undefined,
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forum Moderation</h1>
        </div>

        {/* Stats Cards */}
        {!isLoadingStats && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                    Pending Reports
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
                    {stats.pendingReports}
                  </p>
                </div>
                <Flag className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Flagged Content
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                    {stats.flaggedContent}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Resolved Reports
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                    {stats.resolvedReports}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 w-full max-w-full overflow-y-auto max-h-[calc(100vh-400px)]">
        {activeTab === 'reports' && <ReportsTab onStatsUpdate={loadStats} />}
        {activeTab === 'flagged' && <FlaggedContentTab onStatsUpdate={loadStats} />}
        {activeTab === 'users' && <AllUsersTab onStatsUpdate={loadStats} />}
        {activeTab === 'deleted' && <DeletedContentTab onStatsUpdate={loadStats} />}
        {activeTab === 'logs' && <ModerationLogsTab />}
      </div>
    </div>
  )
}
