import React, { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { AffiliateLink, CreateLinkData, UpdateLinkData } from '@/services/api/affiliates'
import { useAffiliatePartners, useAffiliateLinkTypes } from '@/services/hooks/useAffiliates'
import { occupationApi } from '@/services/api/occupation'
import type { Occupation } from '@/services/types/occupation'
import SingleSelect from '@/components/molecules/SingleSelect'
import SelectCity from '@/components/molecules/SelectCity'

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'PR', label: 'Puerto Rico' }, { value: 'GU', label: 'Guam' },
  { value: 'VI', label: 'U.S. Virgin Islands' },
]

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
    format: '',
    city: '',
    state: '',
    zipCode: '',
    targetAudience: '',
    contentLevel: '',
    overview: '',
    courseThumbnail: '',
    ceHours: undefined,
    ceCredits: undefined,
    occupations: [],
    affiliateId: '',
  })
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [occupationsLoading, setOccupationsLoading] = useState(false)

  const { data: partnersData } = useAffiliatePartners({ limit: 1000, status: 'active' })
  const { data: linkTypes = [] } = useAffiliateLinkTypes()

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
        format: link.format || '',
        city: link.city || '',
        state: link.state || '',
        zipCode: link.zipCode || '',
        targetAudience: link.targetAudience || '',
        contentLevel: link.contentLevel || '',
        overview: link.overview || '',
        courseThumbnail: link.courseThumbnail || '',
        ceHours: link.ceHours,
        ceCredits: link.ceCredits,
        occupations: link.occupations || [],
        affiliateId: link.affiliateId,
      })
    } else {
      setFormData({
        name: '',
        url: '',
        type: '',
        format: '',
        city: '',
        state: '',
        zipCode: '',
        targetAudience: '',
        contentLevel: '',
        overview: '',
        courseThumbnail: '',
        ceHours: undefined,
        ceCredits: undefined,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[640px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
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
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Uncategorized</option>
                {linkTypes
                  .filter((t) => t.isActive || t.name === formData.type)
                  .map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Used to categorize this link on the Career Center page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={formData.format || ''}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Select format</option>
                <option value="IN_PERSON">In-Person</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONLINE_COURSE">Online Course</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Delivery format shown on the Career Center filter
              </p>
            </div>

            <div>
              <SelectCity
                stateValue={formData.state}
                value={formData.city || ''}
                onChange={(val) => setFormData({ ...formData, city: val })}
                placeholder="City"
              />
            </div>

            <div>
              <SingleSelect
                label="State"
                options={US_STATES}
                value={formData.state || ''}
                onChange={(val) => setFormData({ ...formData, state: val, city: '' })}
                placeholder="Select state"
                searchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode || ''}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. 40202"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience || ''}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. mental health professionals in Kentucky"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Level
              </label>
              <input
                type="text"
                value={formData.contentLevel || ''}
                onChange={(e) => setFormData({ ...formData, contentLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. beginning to expert"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Overview
              </label>
              <textarea
                rows={5}
                value={formData.overview || ''}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[120px]"
                placeholder="Brief overview of the course content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Thumbnail URL
              </label>
              <input
                type="url"
                value={formData.courseThumbnail || ''}
                onChange={(e) => setFormData({ ...formData, courseThumbnail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional URL for a thumbnail image shown on the Career Center card
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CE Hours
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ceHours ?? ''}
                  onChange={(e) => setFormData({ ...formData, ceHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. 1.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CE Credits
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ceCredits ?? ''}
                  onChange={(e) => setFormData({ ...formData, ceCredits: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. 15.0"
                />
              </div>
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
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
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
    </>
  )
}
