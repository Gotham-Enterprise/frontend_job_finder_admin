"use client";
import React, { useState, useMemo } from "react";
import { useModal } from "@/hooks/useModal";
import { useTags, useCreateTag, useDeleteTag, useBulkDeleteTags } from "@/services/hooks/useTags";
import { NewTag } from "@/services/api/tag";
import { showToast } from "@/services/utils/toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import BulkActionBar from "@/components/ui/BulkActionBar";
import BulkActionDropdown from "@/components/ui/BulkActionDropdown";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { TagForm, TagList, TagEditModal } from "./Tags/";

export default function AddTags() {
  const [newTag, setNewTag] = useState<NewTag>({
    name: '',
    description: ''
  });

  const [editingTag, setEditingTag] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const editModal = useModal();
  const confirmation = useConfirmation();

  const { data: tagsResponse, isLoading, error, refetch } = useTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();
  const bulkDeleteTagsMutation = useBulkDeleteTags();

  const tags = tagsResponse?.data || [];
  const isDeleting = deleteTagMutation.isPending;
  const isBulkDeleting = bulkDeleteTagsMutation.isPending;
  const isCreating = createTagMutation.isPending;

  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredTags]);

  const initInputChange = (field: keyof NewTag, value: string) => {
    setNewTag(prev => {
      const updated = { ...prev, [field]: value };
      
      return updated;
    });
  };

  const addTag = async () => {
    if (!newTag.name.trim()) {
      showToast.error('Validation Error', 'Tag name is required');
      return;
    }

    try {
      const response = await createTagMutation.mutateAsync(newTag);
      if (response.success) {
        showToast.success('Success', 'Tag created successfully');
        setNewTag({ name: '', description: '' });
        setIsSlugManuallyEdited(false);
      } else {
        showToast.error('Error', response.message || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      showToast.error('Error', 'Failed to create tag');
    }
  };

  const editTag = (tag: any) => {
    setEditingTag(tag);
    editModal.openModal();
  };

  const deleteTag = async (tagId: string) => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Tag',
      message: 'Are you sure you want to delete this tag? This action cannot be undone.'
    });

    if (confirmed) {
      try {
        const response = await deleteTagMutation.mutateAsync(tagId);
        if (response.success) {
          showToast.success('Success', 'Tag deleted successfully');
          setSelectedTags(prev => prev.filter(id => id !== tagId));
        } else {
          showToast.error('Error', response.message || 'Failed to delete tag');
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
        showToast.error('Error', 'Failed to delete tag');
      }
    }
  };

  const toggleTagSelection = (tagId: string, selected: boolean) => {
    setSelectedTags(prev => 
      selected 
        ? [...prev, tagId]
        : prev.filter(id => id !== tagId)
    );
  };

  const selectAllTags = (selected: boolean) => {
    if (selected) {
      setSelectedTags(sortedTags.map(tag => tag.id));
    } else {
      setSelectedTags([]);
    }
  };

  const clearSelection = () => {
    setSelectedTags([]);
  };

  const bulkDeleteTags = async () => {
    if (selectedTags.length === 0) {
      showToast.error('No Selection', 'Please select tags to delete');
      return;
    }

    const count = selectedTags.length;
    const message = count === 1 
      ? 'Are you sure you want to delete this tag?' 
      : `Are you sure you want to delete ${count} tags?`;

    const confirmed = await confirmation.confirm({
      title: 'Delete Tags',
      message: `${message} This action cannot be undone.`
    });

    if (confirmed) {
      try {
        const response = await bulkDeleteTagsMutation.mutateAsync({ tagIds: selectedTags });
        if (response.success) {
          showToast.success('Success', `${count} tag${count > 1 ? 's' : ''} deleted successfully`);
          setSelectedTags([]);
        } else {
          showToast.error('Error', response.message || 'Failed to delete tags');
        }
      } catch (error) {
        console.error('Error bulk deleting tags:', error);
        showToast.error('Error', 'Failed to delete tags');
      }
    }
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading tags..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading tags</p>
          <p className="text-gray-500 text-sm mb-4">
            {(error as any)?.message || 'Failed to fetch tags from the server'}
          </p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tags</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your blog tags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TagForm
            newTag={newTag}
            onInputChange={initInputChange}
            onAddTag={addTag}
            isCreating={isCreating}
          />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tags ({tags.length})
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <BulkActionDropdown
                    selectedItems={selectedTags}
                    onBulkDelete={bulkDeleteTags}
                    onClearSelection={clearSelection}
                    isDeleting={isBulkDeleting}
                    itemType="tags"
                  />
                </div>
              </div>
            </div>

            <BulkActionBar
              selectedItems={selectedTags}
              totalItems={sortedTags.length}
              itemType="tags"
              onBulkDelete={bulkDeleteTags}
              onSelectAll={selectAllTags}
              onClearSelection={clearSelection}
              isDeleting={isBulkDeleting}
            />

            <TagList
              tags={sortedTags}
              searchTerm={searchTerm}
              selectedTags={selectedTags}
              onSearchChange={setSearchTerm}
              onEditTag={editTag}
              onDeleteTag={deleteTag}
              onToggleSelection={toggleTagSelection}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>

      <TagEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
      />
    </div>
  );
}
