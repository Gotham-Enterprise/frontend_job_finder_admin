'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Link as LinkIcon, Building2, Calendar } from 'lucide-react'
import {
  useAffiliateLinks,
  useCreateAffiliateLink,
  useUpdateAffiliateLink,
  useDeleteAffiliateLink,
} from '@/services/hooks/useAffiliates'
import type { AffiliateLink, CreateLinkData, UpdateLinkData } from '@/services/api/affiliates'
import LinkModal from './components/LinkModal'

export default function AffiliateLinks() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)

  const { data: linksData, isLoading } = useAffiliateLinks({ page, limit: 10 })
  const createMutation = useCreateAffiliateLink()
  const updateMutation = useUpdateAffiliateLink()
  const deleteMutation = useDeleteAffiliateLink()

  const handleCreate = () => {
    setEditingLink(null)
    setIsModalOpen(true)
  }

  const handleEdit = (link: AffiliateLink) => {
    setEditingLink(link)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (data: CreateLinkData | UpdateLinkData) => {
    if (editingLink) {
      await updateMutation.mutateAsync({ id: editingLink.id, data: data as UpdateLinkData })
    } else {
      await createMutation.mutateAsync(data as CreateLinkData)
    }
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Links</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your internal affiliate links connecting to partner feeds.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name / Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Occupations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company (Partner)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
              {linksData?.data?.map((link) => (
                <tr
                  key={link.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {link.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                        {link.url}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {link.type || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {link.occupations && link.occupations.length > 0 ? (
                        link.occupations.map((occ) => (
                          <span
                            key={occ}
                            className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md"
                          >
                            {occ}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {link.affiliate?.name || 'Unknown Partner'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(link)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!linksData?.data || linksData.data.length === 0) && !isLoading && (
            <div className="text-center py-12">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No affiliate links found</p>
              <button
                onClick={handleCreate}
                className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
              >
                Add your first link
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {linksData && linksData.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 mt-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {linksData.page} of {linksData.totalPages}
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
                disabled={page === linksData.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <LinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        link={editingLink}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
