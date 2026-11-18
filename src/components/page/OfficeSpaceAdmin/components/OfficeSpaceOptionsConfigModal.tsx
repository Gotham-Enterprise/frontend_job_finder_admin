"use client";

import React, { useState } from "react";
import { X, Plus, ArrowUp, ArrowDown, Pencil, Trash2, Check } from "lucide-react";
import {
  useOfficeSpaceSpecialties,
  useCreateOfficeSpaceSpecialty,
  useUpdateOfficeSpaceSpecialty,
  useDeleteOfficeSpaceSpecialty,
  useReorderOfficeSpaceSpecialties,
  useOfficeSpacePropertyTypes,
  useCreateOfficeSpacePropertyType,
  useUpdateOfficeSpacePropertyType,
  useDeleteOfficeSpacePropertyType,
  useReorderOfficeSpacePropertyTypes,
} from "@/services/hooks/useOfficeSpaceOptions";
import type { OfficeSpaceOption } from "@/services/types/officeSpace";

interface OfficeSpaceOptionsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "specialties" | "propertyTypes";
}

export default function OfficeSpaceOptionsConfigModal({
  isOpen,
  onClose,
  defaultTab = "specialties",
}: OfficeSpaceOptionsConfigModalProps) {
  const [activeTab, setActiveTab] = useState<"specialties" | "propertyTypes">(defaultTab);

  // Specialties
  const { data: specialties = [], isLoading: loadingSpecialties } = useOfficeSpaceSpecialties();
  const createSpecialtyMutation = useCreateOfficeSpaceSpecialty();
  const updateSpecialtyMutation = useUpdateOfficeSpaceSpecialty();
  const deleteSpecialtyMutation = useDeleteOfficeSpaceSpecialty();
  const reorderSpecialtiesMutation = useReorderOfficeSpaceSpecialties();

  // Property Types
  const { data: propertyTypes = [], isLoading: loadingPropertyTypes } = useOfficeSpacePropertyTypes();
  const createPropertyTypeMutation = useCreateOfficeSpacePropertyType();
  const updatePropertyTypeMutation = useUpdateOfficeSpacePropertyType();
  const deletePropertyTypeMutation = useDeleteOfficeSpacePropertyType();
  const reorderPropertyTypesMutation = useReorderOfficeSpacePropertyTypes();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const isSpecialties = activeTab === "specialties";
  const items = isSpecialties ? specialties : propertyTypes;
  const isLoading = isSpecialties ? loadingSpecialties : loadingPropertyTypes;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    if (isSpecialties) {
      await createSpecialtyMutation.mutateAsync({ name });
    } else {
      await createPropertyTypeMutation.mutateAsync({ name });
    }
    setNewName("");
  };

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;

    if (isSpecialties) {
      await updateSpecialtyMutation.mutateAsync({ id, data: { name } });
    } else {
      await updatePropertyTypeMutation.mutateAsync({ id, data: { name } });
    }
    setEditingId(null);
    setEditName("");
  };

  const handleToggleActive = async (item: OfficeSpaceOption) => {
    if (isSpecialties) {
      await updateSpecialtyMutation.mutateAsync({
        id: item.id,
        data: { isActive: !item.isActive },
      });
    } else {
      await updatePropertyTypeMutation.mutateAsync({
        id: item.id,
        data: { isActive: !item.isActive },
      });
    }
  };

  const handleDelete = async (item: OfficeSpaceOption) => {
    const label = isSpecialties ? "specialty" : "property type";
    if (confirm(`Delete ${label} "${item.name}"? Existing listings with this ${label} will keep their value.`)) {
      if (isSpecialties) {
        await deleteSpecialtyMutation.mutateAsync(item.id);
      } else {
        await deletePropertyTypeMutation.mutateAsync(item.id);
      }
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const a = next[index];
    next[index] = next[target];
    next[target] = a;

    if (isSpecialties) {
      await reorderSpecialtiesMutation.mutateAsync(next.map((t) => t.id));
    } else {
      await reorderPropertyTypesMutation.mutateAsync(next.map((t) => t.id));
    }
  };

  const isCreating = isSpecialties
    ? createSpecialtyMutation.isPending
    : createPropertyTypeMutation.isPending;

  const isReordering = isSpecialties
    ? reorderSpecialtiesMutation.isPending
    : reorderPropertyTypesMutation.isPending;

  const isDeleting = isSpecialties
    ? deleteSpecialtyMutation.isPending
    : deletePropertyTypeMutation.isPending;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[640px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Office Space Options
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage dynamic filters and dropdown categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => {
              setActiveTab("specialties");
              setEditingId(null);
              setNewName("");
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              isSpecialties
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Specialties ({specialties.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("propertyTypes");
              setEditingId(null);
              setNewName("");
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              !isSpecialties
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Property Types ({propertyTypes.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isSpecialties
              ? 'Categories shown on the Commercial Office Spaces "Specialty" search filter.'
              : 'Types shown on the Commercial Office Spaces "Property type" search filter and listing creation.'}
          </p>

          {/* Add form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              placeholder={isSpecialties ? "New specialty name (e.g. Dental)" : "New property type (e.g. Medical)"}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">
              No {isSpecialties ? "specialties" : "property types"} yet. Add your first one above.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3.5 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {/* Up / Down arrows */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || isReordering}
                      className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors p-0.5"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1 || isReordering}
                      className="text-gray-400 hover:text-primary disabled:opacity-30 transition-colors p-0.5"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name + value badge */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(item.id);
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-primary rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">
                          {item.value}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Edit rename button */}
                  <button
                    onClick={() => {
                      if (editingId === item.id) {
                        handleRename(item.id);
                      } else {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }
                    }}
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                    title={editingId === item.id ? "Save" : "Rename"}
                  >
                    {editingId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </button>

                  {/* Toggle Active / Inactive switch */}
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      item.isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    title={item.isActive ? "Active" : "Inactive"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.isActive ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
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
  );
}
