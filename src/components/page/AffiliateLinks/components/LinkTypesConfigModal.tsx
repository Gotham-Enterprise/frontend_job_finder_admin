'use client'

import React, { useState } from 'react'
import { X, Plus, ArrowUp, ArrowDown, Pencil, Trash2, Check } from 'lucide-react'
import {
  useAffiliateLinkTypes,
  useCreateAffiliateLinkType,
  useUpdateAffiliateLinkType,
  useDeleteAffiliateLinkType,
  useReorderAffiliateLinkTypes,
} from '@/services/hooks/useAffiliates'
import type { AffiliateLinkType } from '@/services/api/affiliates'

interface LinkTypesConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LinkTypesConfigModal({ isOpen, onClose }: LinkTypesConfigModalProps) {
  const { data: types = [], isLoading } = useAffiliateLinkTypes()
  const createMutation = useCreateAffiliateLinkType()
  const updateMutation = useUpdateAffiliateLinkType()
  const deleteMutation = useDeleteAffiliateLinkType()
  const reorderMutation = useReorderAffiliateLinkTypes()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await createMutation.mutateAsync({ name })
    setNewName('')
  }

  const handleRename = async (id: string) => {
    const name = editName.trim()
    if (!name) return
    await updateMutation.mutateAsync({ id, data: { name } })
    setEditingId(null)
    setEditName('')
  }

  const handleToggleActive = async (type: AffiliateLinkType) => {
    await updateMutation.mutateAsync({ id: type.id, data: { isActive: !type.isActive } })
  }

  const handleDelete = async (type: AffiliateLinkType) => {
    if (confirm(`Delete link type "${type.name}"? Existing links will keep their value.`)) {
      await deleteMutation.mutateAsync(type.id)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= types.length) return
    const next = [...types]
    const a = next[index]
    next[index] = next[target]
    next[target] = a
    await reorderMutation.mutateAsync(next.map((t) => t.id))
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Link Types</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Categories shown on the Career Center &quot;Event Type&quot; filter and in the Category dropdown when
            creating or editing a link.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              placeholder="New type name"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : types.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No link types yet. Add your first one above.</p>
          ) : (
            <div className="space-y-2">
              {types.map((type, index) => (
                <div
                  key={type.id}
                  className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reorderMutation.isPending}
                      className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === types.length - 1 || reorderMutation.isPending}
                      className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === type.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(type.id)
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-primary rounded-md text-sm"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (editingId === type.id) {
                        handleRename(type.id)
                      } else {
                        setEditingId(type.id)
                        setEditName(type.name)
                      }
                    }}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Rename"
                  >
                    {editingId === type.id ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleToggleActive(type)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      type.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={type.isActive ? 'Active' : 'Inactive'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        type.isActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleDelete(type)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
