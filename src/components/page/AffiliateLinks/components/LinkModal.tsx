import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { AffiliateLink, CreateLinkData, UpdateLinkData } from '@/services/api/affiliates'
import { useAffiliatePartners } from '@/services/hooks/useAffiliates'
import { occupationApi } from '@/services/api/occupation'
import type { Occupation } from '@/services/types/occupation'

interface LinkModalProps {
  isOpen: boolean
  onClose: () => void
  link: AffiliateLink | null
  onSubmit: (data: CreateLinkData | UpdateLinkData) => Promise<void>
  isSubmitting: boolean
}

export default function LinkModal({ isOpen, onClose, link, onSubmit, isSubmitting }: LinkModalProps) {
  const [formData, setFormData] = useState<CreateLinkData>({
    name: '',
    url: '',
    type: '',
    occupations: [],
    affiliateId: '',
  })
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [occupationsLoading, setOccupationsLoading] = useState(false)

  const { data: partnersData } = useAffiliatePartners({ limit: 1000, status: 'active' })

  useEffect(() => {
    if (isOpen) {
      setOccupationsLoading(true)
      occupationApi.getOccupationList()
        .then((res) => {
          setOccupations(res.data || [])
        })
        .catch(() => {
          setOccupations([])
        })
        .finally(() => {
          setOccupationsLoading(false)
        })
    }
  }, [isOpen])

  useEffect(() => {
    if (link) {
      setFormData({
        name: link.name,
        url: link.url,
        type: link.type || '',
        occupations: link.occupations || [],
        affiliateId: link.affiliateId,
      })
    } else {
      setFormData({
        name: '',
        url: '',
        type: '',
        occupations: [],
        affiliateId: '',
      })
    }
  }, [link, isOpen])

  const toggleOccupation = (occupationName: string) => {
    setFormData((prev) => {
      const selected = prev.occupations || []
      if (selected.includes(occupationName)) {
        return { ...prev, occupations: selected.filter((o) => o !== occupationName) }
      }
      return { ...prev, occupations: [...selected, occupationName] }
    })
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {link ? 'Edit Affiliate Link' : 'Add Affiliate Link'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name or Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. Survey Junkie Main Link"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[100px]"
              placeholder="https://example.com/ref"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company (Partner) <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.affiliateId}
              onChange={(e) => setFormData({ ...formData, affiliateId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="" disabled>Select a partner</option>
              {partnersData?.data?.map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category / Type
            </label>
            <input
              type="text"
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. Continuing Education, Conference, College Degree"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used to categorize this link on the Career Center page
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Related Occupations
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              {occupationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : occupations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No occupations available</p>
              ) : (
                <div className="p-2 space-y-0.5">
                  {occupations.map((occ) => {
                    const isSelected = (formData.occupations || []).includes(occ.name)
                    return (
                      <label
                        key={occ.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOccupation(occ.name)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{occ.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            {formData.occupations && formData.occupations.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.occupations.length} occupation{formData.occupations.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}