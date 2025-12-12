'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pageVisitAPI } from '@/services/pageVisitAPI'
import type { PageVisitEmailRecipient } from '@/types/page-visit'

export default function EmailRecipientsManager() {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<PageVisitEmailRecipient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enabled: true,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['email-recipients'],
    queryFn: () => pageVisitAPI.getEmailRecipients(),
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => pageVisitAPI.createEmailRecipient(data),
    onSuccess: () => {
      alert('Email recipient added successfully')
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] })
      setIsAddModalOpen(false)
      setFormData({ name: '', email: '', enabled: true })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to add email recipient')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof formData> }) =>
      pageVisitAPI.updateEmailRecipient(id, data),
    onSuccess: () => {
      alert('Email recipient updated successfully')
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] })
      setEditingRecipient(null)
      setFormData({ name: '', email: '', enabled: true })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update email recipient')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageVisitAPI.deleteEmailRecipient(id),
    onSuccess: () => {
      alert('Email recipient deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete email recipient')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      pageVisitAPI.updateEmailRecipient(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update email recipient')
    },
  })

  const recipients = data?.data || []

  const handleAdd = () => {
    setFormData({ name: '', email: '', enabled: true })
    setEditingRecipient(null)
    setIsAddModalOpen(true)
  }

  const handleEdit = (recipient: PageVisitEmailRecipient) => {
    setFormData({
      name: recipient.name,
      email: recipient.email,
      enabled: recipient.enabled,
    })
    setEditingRecipient(recipient)
    setIsAddModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    if (editingRecipient) {
      updateMutation.mutate({ id: editingRecipient.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggle = (id: string, enabled: boolean) => {
    toggleMutation.mutate({ id, enabled: !enabled })
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          Error loading email recipients. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Email Recipients
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage who receives page visit alert notifications
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Add Recipient
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
        </div>
      ) : recipients.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No email recipients configured. Add one to start receiving alerts.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {recipient.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {recipient.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggle(recipient.id, recipient.enabled)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        recipient.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {recipient.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(recipient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(recipient)}
                      className="mr-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipient.id, recipient.name)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {editingRecipient ? 'Edit Recipient' : 'Add Email Recipient'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="enabled"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Enable notifications for this recipient
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingRecipient(null)
                    setFormData({ name: '', email: '', enabled: true })
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingRecipient
                      ? 'Update'
                      : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
