'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Copy, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { AffiliatePartner, CreatePartnerData } from '@/services/api/affiliates'
import { useRebuildOutboundFeed } from '@/services/hooks/useAffiliates'
import { showToast } from '@/services/utils/toast'

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
  partner: AffiliatePartner | null
  onSubmit: (data: CreatePartnerData) => void
  isSubmitting: boolean
}

type PartnerFormData = CreatePartnerData & {
  outboundFeedEnabled?: boolean
  outboundFeedCronExpression?: string
  outboundFeedTimezone?: string
}

export default function PartnerModal({
  isOpen,
  onClose,
  partner,
  onSubmit,
  isSubmitting,
}: PartnerModalProps) {
  const rebuildMutation = useRebuildOutboundFeed()
  const [showFullError, setShowFullError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartnerFormData>()

  const outboundEnabled = watch('outboundFeedEnabled')
  const feedUrl = partner?.outboundFeedUrl

  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name,
        email: partner.email,
        contactPerson: partner.contactPerson || '',
        phone: partner.phone || '',
        website: partner.website || '',
        outboundFeedEnabled: partner.outboundFeedEnabled || false,
        outboundFeedCronExpression: partner.outboundFeedCronExpression || '0 5 * * *',
        outboundFeedTimezone: partner.outboundFeedTimezone || 'UTC',
      })
    } else {
      reset({
        name: '',
        email: '',
        contactPerson: '',
        phone: '',
        website: '',
      })
    }
    setShowFullError(false)
  }, [partner, reset])

  if (!isOpen) return null

  const handleFormSubmit = (data: PartnerFormData) => {
    const submitData = { ...data }
    if (data.logo && (data.logo as unknown as FileList).length > 0) {
      submitData.logo = (data.logo as unknown as FileList)[0]
    } else {
      delete submitData.logo
    }
    onSubmit(submitData as CreatePartnerData)
  }

  const handleCopyUrl = async () => {
    if (!feedUrl) return
    try {
      await navigator.clipboard.writeText(feedUrl)
      showToast.success('Copied', 'Feed URL copied to clipboard')
    } catch {
      showToast.error('Copy Failed', 'Could not copy feed URL')
    }
  }

  const handleRebuild = async () => {
    if (!partner) return
    if (!confirm(`Rebuild outbound feed for ${partner.name}?`)) return
    await rebuildMutation.mutateAsync(partner.id)
  }

  const getBuildStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Never built
        </span>
      )
    }
    const styles: Record<string, string> = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    }
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      in_progress: <AlertCircle className="w-3 h-3" />,
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || styles.success
        }`}
      >
        {icons[status]}
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {partner ? 'Edit Partner' : 'Create New Partner'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: 'Partner name is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="e.g., Adzuna"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="partner@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person
              </label>
              <input
                {...register('contactPerson')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company / Partner Logo
              </label>
              <input
                {...register('logo')}
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {partner?.logoUrl && (
                <div className="mt-2 text-sm text-gray-500">
                  Current Logo:{' '}
                  <a href={partner.logoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    View Image
                  </a>
                </div>
              )}
            </div>

            {/* Outbound Feed Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Outbound Feed</h4>

              {!partner ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Save the partner first to configure outbound feed settings.
                </p>
              ) : (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('outboundFeedEnabled')}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Enable outbound XML job feed
                    </span>
                  </label>

                  {outboundEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Feed URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={feedUrl || 'Will be generated after save'}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-sm"
                          />
                          {feedUrl && (
                            <button
                              type="button"
                              onClick={handleCopyUrl}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cron Schedule
                          </label>
                          <input
                            {...register('outboundFeedCronExpression')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder="0 5 * * *"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Timezone
                          </label>
                          <input
                            {...register('outboundFeedTimezone')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder="UTC"
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Build Status
                          </span>
                          {getBuildStatusBadge(partner.outboundFeedLastBuildStatus)}
                        </div>
                        {partner.outboundFeedLastBuiltAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last built: {new Date(partner.outboundFeedLastBuiltAt).toLocaleString()}
                          </p>
                        )}
                        {partner.outboundFeedJobCount != null && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Jobs in feed: {partner.outboundFeedJobCount.toLocaleString()}
                          </p>
                        )}
                        {partner.outboundFeedLastBuildError && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            <p className={showFullError ? '' : 'line-clamp-2'}>
                              {partner.outboundFeedLastBuildError}
                            </p>
                            {partner.outboundFeedLastBuildError.length > 120 && (
                              <button
                                type="button"
                                onClick={() => setShowFullError(!showFullError)}
                                className="text-primary hover:underline mt-1"
                              >
                                {showFullError ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRebuild}
                          disabled={
                            rebuildMutation.isPending ||
                            partner.outboundFeedLastBuildStatus === 'in_progress'
                          }
                          className="mt-2 flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${rebuildMutation.isPending ? 'animate-spin' : ''}`}
                          />
                          Rebuild Now
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {partner ? 'Update Partner' : 'Create Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
