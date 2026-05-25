'use client'

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Globe, Eye } from 'lucide-react'
import { useSurveyJobs, useToggleSurveyJob, useDeleteSurveyJob } from '@/services/hooks/useSurveyJobs'
import type { SurveyJob } from '@/services/api/surveyJobs'
import Pagination from '@/components/tables/Pagination'
import CreateSurveyJobModal from './CreateSurveyJobModal'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

const PAGE_SIZE = 15

export default function SurveyJobsTab() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<SurveyJob | null>(null)
  const [jobToDelete, setJobToDelete] = useState<SurveyJob | null>(null)

  const { data, isLoading, isError } = useSurveyJobs({ page, limit: PAGE_SIZE })
  const toggleMutation = useToggleSurveyJob()
  const deleteMutation = useDeleteSurveyJob()

  const handleAdd = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleEdit = (job: SurveyJob) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleToggle = (job: SurveyJob) => {
    toggleMutation.mutate({ id: job.id, isPublished: !job.isPublished })
  }

  const handleDelete = (job: SurveyJob) => {
    setJobToDelete(job)
  }

  const handleConfirmDelete = () => {
    if (!jobToDelete) return
    deleteMutation.mutate(jobToDelete.id, {
      onSettled: () => setJobToDelete(null),
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingJob(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Survey Jobs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manually posted opportunities via Survey Junkie
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Survey Job
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          Failed to load survey jobs. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Globe className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No survey jobs yet</p>
          <p className="text-xs mt-1">Click "Add Survey Job" to create the first one.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Occupation
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Work Type
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Views
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Published
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.data.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-xs truncate">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {[job.locationCity, job.locationState].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {job.occupation?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {job.workType ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-sm">{(job.viewsCount ?? 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(job)}
                        disabled={toggleMutation.isPending}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                          job.isPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        } disabled:opacity-50`}
                        title={job.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            job.isPublished ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(job)}
                          title="Edit"
                          className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          title="Delete"
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, data.pagination.total)} of{' '}
                {data.pagination.total.toLocaleString()} jobs
              </p>
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <CreateSurveyJobModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        job={editingJob}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setJobToDelete(null)}
        title="Delete Survey Job"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
