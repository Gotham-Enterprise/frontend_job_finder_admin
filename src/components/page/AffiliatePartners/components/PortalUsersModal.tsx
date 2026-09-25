'use client'

import React, { useState } from 'react'
import { X, Users, Trash2, Plus, Loader2 } from 'lucide-react'
import {
  usePortalUsers,
  useCreatePortalUser,
  useUpdatePortalUser,
  useDeletePortalUser,
} from '@/services/hooks/useAffiliates'
import type { AffiliatePortalUser } from '@/services/api/affiliates'
import { useAffiliatePermissions } from '@/hooks/useAffiliatePermissions'

interface Props {
  isOpen: boolean
  onClose: () => void
  partnerId: string
  partnerName: string
}

const emptyForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
}

export default function PortalUsersModal({ isOpen, onClose, partnerId, partnerName }: Props) {
  const { canCreate, canUpdate, canDelete } = useAffiliatePermissions()
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState<AffiliatePortalUser | null>(null)
  const [editPassword, setEditPassword] = useState('')

  const { data: users = [], isLoading } = usePortalUsers(isOpen ? partnerId : '')
  const createMutation = useCreatePortalUser()
  const updateMutation = useUpdatePortalUser()
  const deleteMutation = useDeletePortalUser()

  if (!isOpen) return null

  const resetCreate = () => {
    setForm(emptyForm)
    setFormError('')
  }

  const handleCreate = async () => {
    setFormError('')
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.password) {
      setFormError('Email, first name, last name, and password are required.')
      return
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    try {
      await createMutation.mutateAsync({
        partnerId,
        data: {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          password: form.password,
        },
      })
      resetCreate()
    } catch {
      // toast handled in the hook
    }
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    if (editPassword && editPassword.length < 8) {
      return
    }
    await updateMutation.mutateAsync({
      partnerId,
      userId: editing.id,
      data: {
        firstName: editing.firstName.trim(),
        lastName: editing.lastName.trim(),
        email: editing.email.trim(),
        status: editing.status,
        ...(editPassword ? { password: editPassword } : {}),
      },
    })
    setEditing(null)
    setEditPassword('')
  }

  const handleDelete = async (user: AffiliatePortalUser) => {
    if (!confirm(`Delete ${user.email}? They will no longer be able to sign in.`)) return
    await deleteMutation.mutateAsync({ partnerId, userId: user.id })
    if (editing?.id === user.id) {
      setEditing(null)
      setEditPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Dashboard Users</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{partnerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These accounts can sign in to the partner dashboard and see only {partnerName}&apos;s performance data.
          </p>

          {canCreate && (
            <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add user</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password (min 8 characters)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <button
                type="button"
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add user
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No dashboard users yet.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  {editing?.id === user.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={editing.firstName}
                          onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                        <input
                          value={editing.lastName}
                          onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                        <input
                          type="email"
                          value={editing.email}
                          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                        <select
                          value={editing.status}
                          onChange={(e) =>
                            setEditing({ ...editing, status: e.target.value as 'active' | 'disabled' })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="New password (optional)"
                          className="sm:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      {editPassword && editPassword.length < 8 && (
                        <p className="text-sm text-red-600">Password must be at least 8 characters.</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending || (!!editPassword && editPassword.length < 8)}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(null)
                            setEditPassword('')
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.status === 'active' ? 'Active' : 'Disabled'}
                          {user.lastLoginAt
                            ? ` · Last login ${new Date(user.lastLoginAt).toLocaleString()}`
                            : ' · Never signed in'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(user)
                              setEditPassword('')
                            }}
                            className="text-sm text-primary"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
