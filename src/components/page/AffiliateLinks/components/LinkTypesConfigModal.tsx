'use client'

import React, { useState } from 'react'
import { X, Plus, ArrowUp, ArrowDown, Pencil, Trash2, Check, CornerDownRight } from 'lucide-react'
import {
  useAffiliateLinkTypes,
  useCreateAffiliateLinkType,
  useUpdateAffiliateLinkType,
  useDeleteAffiliateLinkType,
  useReorderAffiliateLinkTypes,
} from '@/services/hooks/useAffiliates'
import type { AffiliateLinkType } from '@/services/api/affiliates'
import { useAffiliatePermissions } from '@/hooks/useAffiliatePermissions'

interface LinkTypesConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LinkTypesConfigModal({ isOpen, onClose }: LinkTypesConfigModalProps) {
  const { canCreate, canUpdate, canDelete } = useAffiliatePermissions()
  const { data: types = [], isLoading } = useAffiliateLinkTypes()
  const createMutation = useCreateAffiliateLinkType()
  const updateMutation = useUpdateAffiliateLinkType()
  const deleteMutation = useDeleteAffiliateLinkType()
  const reorderMutation = useReorderAffiliateLinkTypes()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  // Top-level type id whose "Add sub-type" input is open, and its draft name
  const [addingUnderId, setAddingUnderId] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')

  // The admin endpoint returns a one-level tree: top-level types with `children`.
  const topLevel = types.filter((t) => !t.parentId)

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await createMutation.mutateAsync({ name })
    setNewName('')
  }

  const handleCreateSub = async (parentId: string) => {
    const name = newSubName.trim()
    if (!name) return
    await createMutation.mutateAsync({ name, parentId })
    setNewSubName('')
    setAddingUnderId(null)
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
    const subCount = type.children?.length ?? 0
    const message = subCount > 0
      ? `Delete link type "${type.name}"? Its ${subCount} sub-type${subCount === 1 ? '' : 's'} will be deleted too, and every link using them becomes Uncategorized.`
      : `Delete ${type.parentId ? 'sub-type' : 'link type'} "${type.name}"? Links using it become Uncategorized.`
    if (confirm(message)) {
      await deleteMutation.mutateAsync(type.id)
    }
  }

  // Reorder within one sibling list only; the backend rejects mixed parents.
  const move = async (siblings: AffiliateLinkType[], index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= siblings.length) return
    const next = [...siblings]
    const a = next[index]
    next[index] = next[target]
    next[target] = a
    await reorderMutation.mutateAsync(next.map((t) => t.id))
  }

  const renderRow = (type: AffiliateLinkType, siblings: AffiliateLinkType[], index: number) => {
    const isChild = !!type.parentId
    const subCount = type.children?.length ?? 0
    return (
      <div
        key={type.id}
        className={`flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${
          isChild ? 'ml-8' : ''
        }`}
      >
        {isChild && <CornerDownRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />}

        {canUpdate && (
          <div className="flex flex-col">
            <button
              onClick={() => move(siblings, index, -1)}
              disabled={index === 0 || reorderMutation.isPending}
              className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => move(siblings, index, 1)}
              disabled={index === siblings.length - 1 || reorderMutation.isPending}
              className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {editingId === type.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(type.id)
                if (e.key === 'Escape') {
                  setEditingId(null)
                  setEditName('')
                }
              }}
              autoFocus
              className="w-full px-2 py-1 border border-primary rounded-md text-sm"
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-sm text-gray-900 dark:text-white truncate ${isChild ? '' : 'font-medium'}`}>
                {type.name}
              </span>
              {!isChild && subCount > 0 && (
                <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                  {subCount} sub-type{subCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          )}
        </div>

        {canCreate && !isChild && (
          <button
            onClick={() => {
              setNewSubName('')
              setAddingUnderId(addingUnderId === type.id ? null : type.id)
            }}
            className="text-gray-400 hover:text-primary transition-colors"
            title="Add sub-type"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {canUpdate && (
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
        )}

        <button
          onClick={() => handleToggleActive(type)}
          disabled={!canUpdate}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            type.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
          } disabled:opacity-50`}
          title={
            type.isActive
              ? !isChild && subCount > 0
                ? 'Active. Deactivating hides this category and all its sub-types from the Career Center.'
                : 'Active'
              : 'Inactive'
          }
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              type.isActive ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>

        {canDelete && (
          <button
            onClick={() => handleDelete(type)}
            disabled={deleteMutation.isPending}
            className="text-red-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
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
            Categories shown on the Career Center &quot;Career Development Category&quot; filter and in the
            Category dropdown when creating or editing a link. Each category can have one level of sub-types.
            Deactivating a category also hides its sub-types on the public site.
          </p>

          {canCreate && (
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
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : topLevel.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No link types yet. Add your first one above.</p>
          ) : (
            <div className="space-y-2">
              {topLevel.map((type, index) => {
                const children = type.children ?? []
                return (
                  <React.Fragment key={type.id}>
                    {renderRow(type, topLevel, index)}
                    {children.map((child, childIndex) => renderRow(child, children, childIndex))}
                    {addingUnderId === type.id && canCreate && (
                      <div className="ml-8 flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                        <input
                          type="text"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateSub(type.id)
                            if (e.key === 'Escape') {
                              setAddingUnderId(null)
                              setNewSubName('')
                            }
                          }}
                          autoFocus
                          placeholder={`New sub-type under "${type.name}"`}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => handleCreateSub(type.id)}
                          disabled={createMutation.isPending || !newSubName.trim()}
                          className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingUnderId(null)
                            setNewSubName('')
                          }}
                          className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
