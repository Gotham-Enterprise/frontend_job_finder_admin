"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import { OccupationItem } from '@/services/types/occupation';
import { Specialty } from '@/services/types/specialty';
import {
  useSpecialtiesByOccupationQuery,
  useCreateSpecialty,
  useUpdateSpecialty,
} from '@/services/hooks/useSpecialties';

interface ManageSpecializationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  occupation: OccupationItem | null;
}

export const ManageSpecializationsModal: React.FC<ManageSpecializationsModalProps> = ({
  isOpen,
  onClose,
  occupation,
}) => {
  const [newSpecialtyName, setNewSpecialtyName] = useState('');
  const [newSpecialtyError, setNewSpecialtyError] = useState('');

  // Inline editing state: { id, name }
  const [editingSpecialtyId, setEditingSpecialtyId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingError, setEditingError] = useState('');

  const occupationId = occupation?.id;

  const { data, isLoading } = useSpecialtiesByOccupationQuery(occupationId);

  const createSpecialtyMutation = useCreateSpecialty();
  const updateSpecialtyMutation = useUpdateSpecialty();

  if (!occupation) return null;

  // Extract specialties from the query data or fallback to occupation.specialty
  let specializations: Array<{ id: number; name: string; ordering?: number }> = [];
  if (data?.data) {
    if (Array.isArray(data.data)) {
      specializations = data.data;
    } else if (data.data.specialty) {
      specializations = data.data.specialty;
    }
  } else if (occupation.specialty) {
    specializations = occupation.specialty;
  }

  const handleAddSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSpecialtyName.trim();
    if (!trimmed) {
      setNewSpecialtyError('Specialization name is required');
      return;
    }
    setNewSpecialtyError('');
    await createSpecialtyMutation.mutateAsync({
      name: trimmed,
      occupationIds: [occupation.id],
    });
    setNewSpecialtyName('');
  };

  const handleStartEdit = (item: { id: number; name: string }) => {
    setEditingSpecialtyId(item.id);
    setEditingName(item.name);
    setEditingError('');
  };

  const handleCancelEdit = () => {
    setEditingSpecialtyId(null);
    setEditingName('');
    setEditingError('');
  };

  const handleSaveEdit = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingError('Name is required');
      return;
    }
    setEditingError('');
    await updateSpecialtyMutation.mutateAsync({
      id,
      payload: {
        name: trimmed,
        occupationIds: [occupation.id],
      },
    });
    setEditingSpecialtyId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-16 rounded-xl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Specializations
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Occupation: <span className="font-semibold text-primary">{occupation.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Add Form */}
        <div className="py-4 border-b border-gray-100 dark:border-gray-700">
          <form onSubmit={handleAddSpecialty} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter new specialization name (e.g. Critical Care, Pediatrics)..."
                value={newSpecialtyName}
                onChange={(e) => {
                  setNewSpecialtyName(e.target.value);
                  if (newSpecialtyError) setNewSpecialtyError('');
                }}
                error={Boolean(newSpecialtyError)}
                hint={newSpecialtyError}
                disabled={createSpecialtyMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              variant="default"
              disabled={createSpecialtyMutation.isPending || !newSpecialtyName.trim()}
              className="whitespace-nowrap h-11"
            >
              {createSpecialtyMutation.isPending ? 'Adding...' : 'Add Specialization'}
            </Button>
          </form>
        </div>

        {/* List of Specializations */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading specializations...</span>
            </div>
          ) : specializations.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No specializations yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add the first specialization for {occupation.name} using the field above.
              </p>
            </div>
          ) : (
            specializations.map((spec) => {
              const isEditing = editingSpecialtyId === spec.id;

              return (
                <div
                  key={spec.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30 transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => {
                          setEditingName(e.target.value);
                          if (editingError) setEditingError('');
                        }}
                        error={Boolean(editingError)}
                        hint={editingError}
                        className="h-9"
                        autoFocus
                        disabled={updateSpecialtyMutation.isPending}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => handleSaveEdit(spec.id)}
                        disabled={updateSpecialtyMutation.isPending}
                      >
                        {updateSpecialtyMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateSpecialtyMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary/70" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {spec.name}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(spec)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Edit specialization"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {specializations.length} total specialization{specializations.length === 1 ? '' : 's'}
          </span>
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

