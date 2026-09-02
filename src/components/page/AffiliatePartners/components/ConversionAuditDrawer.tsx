'use client'

import React from 'react'
import Drawer from '@/components/ui/drawer/Drawer'
import {
  useConversionAudit,
  useEnqueueConversionAudits,
} from '@/services/hooks/useAffiliates'
import type { AffiliateConversionRow } from '@/services/api/affiliates'
import { CheckCircle, XCircle, MinusCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

type AuditFilter = 'pass' | 'flagged' | 'incomplete' | 'pending' | 'failed' | 'unaudited'

export function auditDisplay(
  audit?: { status: string; overallResult: string | null } | null
): { label: string; className: string } {
  if (!audit) {
    return {
      label: '—',
      className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    }
  }
  if (audit.status === 'pending') {
    return {
      label: 'Pending',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
  }
  if (audit.status === 'failed') {
    return {
      label: 'Failed',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
  }
  if (audit.overallResult === 'pass') {
    return {
      label: 'Pass',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    }
  }
  if (audit.overallResult === 'flagged') {
    return {
      label: 'Flagged',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
  }
  if (audit.overallResult === 'incomplete') {
    return {
      label: 'Incomplete',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
  }
  return {
    label: '—',
    className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }
}

export function AuditBadge({
  audit,
  onClick,
}: {
  audit?: { status: string; overallResult: string | null } | null
  onClick?: () => void
}) {
  const { label, className } = auditDisplay(audit)
  const clickable = Boolean(onClick && audit)
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className} ${
        clickable ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  )
}

function CheckCard({
  title,
  match,
  reason,
}: {
  title: string
  match: boolean | null | undefined
  reason: string | null | undefined
}) {
  let icon = <MinusCircle className="w-4 h-4 text-gray-400" />
  let label = 'Skipped'
  let tone = 'border-gray-200 dark:border-gray-700'

  if (match === true) {
    icon = <CheckCircle className="w-4 h-4 text-emerald-500" />
    label = 'Match'
    tone = 'border-emerald-200 dark:border-emerald-900/40'
  } else if (match === false) {
    icon = <XCircle className="w-4 h-4 text-red-500" />
    label = 'Flagged'
    tone = 'border-red-200 dark:border-red-900/40'
  }

  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          {icon}
          {label}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {reason || 'No details available.'}
      </p>
    </div>
  )
}

export default function ConversionAuditDrawer({
  conversion,
  onClose,
}: {
  conversion: AffiliateConversionRow | null
  onClose: () => void
}) {
  const conversionId = conversion?.id ?? null
  const { data: audit, isLoading, isError, error } = useConversionAudit(conversionId)
  const enqueueMutation = useEnqueueConversionAudits()

  const handleReaudit = async () => {
    if (!conversionId) return
    if (!confirm('Re-run the occupation audit for this conversion?')) return
    await enqueueMutation.mutateAsync({ conversionId, force: true }).catch(() => undefined)
  }

  const overall = auditDisplay(audit)

  return (
    <Drawer isOpen={!!conversion} onClose={onClose} title="Conversion Audit" width="md">
      <div className="p-6 space-y-5">
        {conversion && (
          <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Job: </span>
              {conversion.jobPostId ? (
                <a
                  href={`/admin/jobs?name=${conversion.jobPostId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {conversion.jobTitle}
                </a>
              ) : (
                conversion.jobTitle
              )}
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Candidate: </span>
              {conversion.candidateId ? (
                <a
                  href={`/admin/job-seekers/details/${conversion.candidateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary hover:underline"
                >
                  {conversion.candidateId}
                </a>
              ) : (
                '—'
              )}
            </div>
            {conversion.applicationId && (
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Application: </span>
                <a
                  href={`/admin/applications/details/${conversion.applicationId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary hover:underline"
                >
                  {conversion.applicationId}
                </a>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {(error as Error)?.message || 'No audit has been recorded for this conversion yet.'}
            </span>
          </div>
        )}

        {audit && (
          <>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${overall.className}`}>
                {overall.label}
              </span>
              {audit.auditedAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Audited {new Date(audit.auditedAt).toLocaleString()}
                </span>
              )}
            </div>

            {audit.status === 'pending' && (
              <p className="text-sm text-blue-600 dark:text-blue-400">Audit in progress…</p>
            )}

            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Candidate occupation</dt>
                <dd className="text-gray-900 dark:text-white text-right">
                  {audit.candidateOccupationName || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Resume occupation</dt>
                <dd className="text-gray-900 dark:text-white text-right">
                  {audit.resumeInferredOccupationName || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Job occupation</dt>
                <dd className="text-gray-900 dark:text-white text-right">
                  {audit.jobOccupationName || '—'}
                </dd>
              </div>
            </dl>

            {audit.status === 'failed' && audit.errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">{audit.errorMessage}</p>
            )}

            <CheckCard
              title="A. Resume vs candidate occupation"
              match={audit.resumeOccupationMatch}
              reason={audit.resumeOccupationReason}
            />
            <CheckCard
              title="B. Job title vs job occupation"
              match={audit.jobTitleOccupationMatch}
              reason={audit.jobTitleOccupationReason}
            />
            <CheckCard
              title="C. Job title vs candidate occupation"
              match={audit.jobTitleCandidateMatch}
              reason={audit.jobTitleCandidateReason}
            />
          </>
        )}

        <button
          type="button"
          onClick={handleReaudit}
          disabled={!conversionId || enqueueMutation.isPending}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${enqueueMutation.isPending ? 'animate-spin' : ''}`} />
          Re-audit this conversion
        </button>
      </div>
    </Drawer>
  )
}

export const AUDIT_FILTERS: { id: '' | AuditFilter; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'pass', label: 'Pass' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'unaudited', label: 'Unaudited' },
]
