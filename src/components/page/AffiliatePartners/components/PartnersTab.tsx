'use client'

import React, { useState, useMemo } from 'react'
import {
  useAffiliatePartners,
  useCreateAffiliatePartner,
  useUpdateAffiliatePartner,
  useDeleteAffiliatePartner,
  useTriggerAffiliateSync,
  useAffiliateSyncStatus,
} from '@/services/hooks/useAffiliates'
import type { AffiliatePartner, CreatePartnerData } from '@/services/api/affiliates'
import { Edit2, Trash2, Plus, Mail, Phone, Globe, DollarSign, CheckCircle, XCircle, AlertCircle, Building2, RefreshCw, Clock, AlertTriangle } from 'lucide-react'
import PartnerModal from './PartnerModal'

export default function PartnersTab() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null)

  const { data: partnersData, isLoading } = useAffiliatePartners({ page, limit: 10 })
  const { data: syncStatusData } = useAffiliateSyncStatus()
  const createMutation = useCreateAffiliatePartner()
  const updateMutation = useUpdateAffiliatePartner()
  const deleteMutation = useDeleteAffiliatePartner()
  const syncMutation = useTriggerAffiliateSync()

  // Merge sync status with partners data
  const partnersWithStatus = useMemo(() => {
    if (!partnersData?.data || !syncStatusData) return partnersData?.data || []
    
    return partnersData.data.map(partner => {
      const syncStatus = syncStatusData.find((s: any) => s.id === partner.id)
      return {
        ...partner,
        isRunning: syncStatus?.isRunning || false,
        activeBatch: syncStatus?.activeBatch || null,
      }
    })
  }, [partnersData, syncStatusData])

  const handleCreate = () => {
    setEditingPartner(null)
    setIsModalOpen(true)
  }

  const handleEdit = (partner: AffiliatePartner) => {
    setEditingPartner(partner)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (data: CreatePartnerData) => {
    if (editingPartner) {
      await updateMutation.mutateAsync({ id: editingPartner.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsModalOpen(false)
  }

  const handleSync = async (id: string, name: string) => {
    // Check if sync is already running for this partner
    const partner = partnersWithStatus.find(p => p.id === id)
    if (partner?.isRunning) {
      alert(`Sync is already in progress for ${name}. Please wait for it to complete.`)
      return
    }

    if (confirm(`Trigger manual sync for ${name}?`)) {
      try {
        await syncMutation.mutateAsync(id)
      } catch (error: any) {
        // Silently handle "already in progress" error as it's just a race condition
        if (error.message?.includes('already in progress')) {
          console.log('Sync already in progress, status will update automatically')
        } else {
          throw error
        }
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
      suspended: <AlertCircle className="w-3 h-3" />,
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.inactive
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Affiliate Partners</h2>
        {/* <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button> */}
      </div>

      {/* Partners Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Partner Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sync Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
            {partnersWithStatus.map((partner) => (
              <tr
                key={partner.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {partner.name}
                    </div>
                    {partner.websiteUrl && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Globe className="w-3 h-3" />
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          {partner.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm space-y-1">
                    {partner.email && (
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Mail className="w-3 h-3" />
                        <span>{partner.email}</span>
                      </div>
                    )}
                    {partner.contactPerson && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {partner.contactPerson}
                      </div>
                    )}
                    {partner.contactPhone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{partner.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {partner.syncEnabled ? (
                      <>
                        {partner.isRunning ? (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Syncing...
                              </span>
                            </div>
                            {partner.activeBatch && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {partner.activeBatch.processedJobs > 0 ? (
                                  <span>
                                    Processing: {partner.activeBatch.processedJobs}/{partner.activeBatch.totalJobs} jobs
                                    {partner.activeBatch.failedJobs > 0 && (
                                      <span className="text-red-500 ml-1">
                                        ({partner.activeBatch.failedJobs} failed)
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>Downloading feed...</span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Auto-sync enabled
                              </span>
                            </div>
                            {partner.lastSyncAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                Last: {new Date(partner.lastSyncAt).toLocaleString()}
                              </div>
                            )}
                            {partner.lastSyncStatus === 'failed' && partner.consecutiveFailures && partner.consecutiveFailures > 0 && (
                              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                Failed ({partner.consecutiveFailures} attempts)
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Sync disabled</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(partner.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {partner.commissionRate ? (
                    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <DollarSign className="w-3 h-3" />
                      <span>{partner.commissionRate}%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {partner.syncEnabled && (
                      <button
                        onClick={() => handleSync(partner.id, partner.name)}
                        disabled={syncMutation.isPending || partner.isRunning}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title={partner.isRunning ? "Sync in progress..." : "Sync Now"}
                      >
                        <RefreshCw className={`w-4 h-4 ${(syncMutation.isPending || partner.isRunning) ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(partner)}
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {partnersWithStatus.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No partners found</p>
            {/* <button
              onClick={handleCreate}
              className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
            >
              Create your first partner
            </button> */}
          </div>
        )}
      </div>

      {/* Pagination */}
      {partnersData && partnersData.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {partnersData.page} of {partnersData.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === partnersData.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Partner Modal */}
      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partner={editingPartner}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
