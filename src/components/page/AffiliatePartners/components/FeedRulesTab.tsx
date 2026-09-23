'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useAffiliatePartners,
  usePartnerFeedRules,
  useCreateFeedRule,
  useUpdateFeedRule,
  useDeleteFeedRule,
} from '@/services/hooks/useAffiliates'
import type { AffiliatePartnerFeedRule, CreateFeedRuleData } from '@/services/api/affiliates'
import { Plus, Edit2, Trash2, ListChecks } from 'lucide-react'
import FeedRuleModal from './FeedRuleModal'
import { useAffiliatePermissions } from '@/hooks/useAffiliatePermissions'

export default function FeedRulesTab() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canCreate, canUpdate, canDelete } = useAffiliatePermissions()
  const partnerFromUrl = searchParams.get('partner') ?? ''
  const outboundOnly = searchParams.get('outbound') !== '0'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AffiliatePartnerFeedRule | null>(null)

  const { data: partnersData, isLoading: loadingPartners } = useAffiliatePartners({ limit: 100 })

  const visiblePartners = useMemo(() => {
    const all = partnersData?.data ?? []
    return outboundOnly ? all.filter((partner) => partner.outboundFeedEnabled) : all
  }, [partnersData, outboundOnly])

  const selectedPartnerId = useMemo(() => {
    if (loadingPartners || !partnersData) return partnerFromUrl
    if (!visiblePartners.length) return ''
    if (visiblePartners.some((partner) => partner.id === partnerFromUrl)) return partnerFromUrl
    return visiblePartners[0].id
  }, [loadingPartners, partnersData, visiblePartners, partnerFromUrl])

  const { data: rules, isLoading: loadingRules } = usePartnerFeedRules(selectedPartnerId)
  const createMutation = useCreateFeedRule()
  const updateMutation = useUpdateFeedRule()
  const deleteMutation = useDeleteFeedRule()

  const replaceFeedRulesParams = (next: { partner?: string; outboundOnly?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'feed-rules')
    const partner = next.partner !== undefined ? next.partner : partnerFromUrl
    const outbound = next.outboundOnly !== undefined ? next.outboundOnly : outboundOnly
    if (partner) params.set('partner', partner)
    else params.delete('partner')
    if (outbound) params.delete('outbound')
    else params.set('outbound', '0')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    if (loadingPartners || !partnersData) return
    if (selectedPartnerId === partnerFromUrl) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'feed-rules')
    if (selectedPartnerId) params.set('partner', selectedPartnerId)
    else params.delete('partner')
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [loadingPartners, partnersData, selectedPartnerId, partnerFromUrl, searchParams, router])

  const handleCreate = () => {
    setEditingRule(null)
    setIsModalOpen(true)
  }

  const handleEdit = (rule: AffiliatePartnerFeedRule) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const handleDelete = async (rule: AffiliatePartnerFeedRule) => {
    if (confirm('Are you sure you want to delete this feed rule?')) {
      await deleteMutation.mutateAsync({ ruleId: rule.id, partnerId: selectedPartnerId })
    }
  }

  const handleSubmit = async (data: CreateFeedRuleData) => {
    if (editingRule) {
      await updateMutation.mutateAsync({
        ruleId: editingRule.id,
        partnerId: selectedPartnerId,
        data,
      })
    } else {
      await createMutation.mutateAsync({ partnerId: selectedPartnerId, data })
    }
    setIsModalOpen(false)
  }

  if (loadingPartners) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feed Rules</h2>
        {canCreate && (
          <button
            onClick={handleCreate}
            disabled={!selectedPartnerId}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-2xl">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Partner
          </label>
          <select
            value={selectedPartnerId}
            onChange={(e) => replaceFeedRulesParams({ partner: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a partner</option>
            {visiblePartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
                {!outboundOnly && partner.outboundFeedEnabled ? ' (outbound enabled)' : ''}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={outboundOnly}
            onChange={(e) => replaceFeedRulesParams({ outboundOnly: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Outbound enabled</span>
        </label>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Occupation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Work Setting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                States
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cities
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
            {loadingRules ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
            ) : !selectedPartnerId ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Select a partner to view feed rules
                </td>
              </tr>
            ) : rules && rules.length > 0 ? (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {rule.ruleGroupLabel || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.occupationName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.specialtyName || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.workSetting || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.states.length === 0 ? 'All' : rule.states.join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {!rule.cities?.length ? 'All' : rule.cities.join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.cpc != null ? `$${rule.cpc.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {rule.cpa != null ? `$${rule.cpa.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${rule.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(rule)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No feed rules for this partner</p>
                  {canCreate && (
                    <button
                      onClick={handleCreate}
                      className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Add your first rule
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FeedRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
