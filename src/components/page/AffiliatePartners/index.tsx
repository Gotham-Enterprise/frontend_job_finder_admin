'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FolderOpen, BarChart3, Handshake, UserCheck, ClipboardList } from 'lucide-react'
import PartnersTab from './components/PartnersTab'
import BatchesTab from './components/BatchesTab'
import AnalyticsTab from './components/AnalyticsTab'
import CoRegistrationTab from './components/CoRegistrationTab'
import SurveyJobsTab from './components/SurveyJobsTab'

type TabType = 'partners' | 'batches' | 'analytics' | 'coreg' | 'survey'

export default function AffiliatePartners() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'analytics')

  useEffect(() => {
    // Update state if URL changes
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // Update URL with the new tab
    router.push(`?tab=${tab}`, { scroll: false })
  }

  const tabs = [
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'partners' as TabType,
      label: 'Partners',
      icon: Handshake,
    },
    {
      id: 'batches' as TabType,
      label: 'Batches',
      icon: FolderOpen,
    },
    {
      id: 'coreg' as TabType,
      label: 'Co Registration',
      icon: UserCheck,
    },
    {
      id: 'survey' as TabType,
      label: 'Survey Jobs',
      icon: ClipboardList,
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'partners':
        return <PartnersTab />
      case 'batches':
        return <BatchesTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'coreg':
        return <CoRegistrationTab />
      case 'survey':
        return <SurveyJobsTab />
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Handshake className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Partners</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          Manage affiliate job board partnerships, XML uploads, batch processing, and analytics
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  )
}
