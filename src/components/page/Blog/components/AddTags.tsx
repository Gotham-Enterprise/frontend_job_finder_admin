"use client";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { useTags, useCreateTag, useBulkDeleteTags } from "@/services/hooks/useTags";
import { NewTag } from "@/services/api/tag";
import { showToast } from "@/services/utils/toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { TagForm, TagList, TagEditModal } from "./Tags/";

export default function AddTags() {
  const [newTag, setNewTag] = useState<NewTag>({
    name: '',
    description: ''
  });

  const [editingTag, setEditingTag] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const editModal = useModal();
  const confirmation = useConfirmation();

  const filters = {
    ...(searchTerm && { keywords: searchTerm }),
    page: currentPage,
    limit: itemsPerPage
  };

  const { data: tagsResponse, isLoading, error, refetch } = useTags(filters);
  const createTagMutation = useCreateTag();
  const bulkDeleteMutation = useBulkDeleteTags();

  const tags = tagsResponse?.data || [];
  const metaData = tagsResponse?.metaData;
  const isCreating = createTagMutation.isPending;

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

  const deleteTag = async (tagIds: string[]) => {
    const tagNames = tagIds.map(id => {
      const tag = tags.find(t => t.id === id);
      return tag?.name || 'unknown';
    }).join(', ');
    
    const confirmed = await confirmation.confirm({
      title: `Delete ${tagIds.length > 1 ? 'Tags' : 'Tag'}`,
      message: `Are you sure you want to delete "${tagNames}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        const response = await bulkDeleteMutation.mutateAsync({ tagIds });
        if (response.success) {
          showToast.success('Success', 'Tag(s) deleted successfully');
        } else {
          showToast.error('Error', response.message || 'Failed to delete tag(s)');
        }
      } catch (error) {
        console.error('Error deleting tag(s):', error);
        showToast.error('Error', 'Failed to delete tag(s)');
      }
    }
  };

  // Bulk selection functions
  const selectTag = (tagId: string, selected: boolean) => {
    setSelectedTags(prev => 
      selected 
        ? [...prev, tagId]
        : prev.filter(id => id !== tagId)
    );
  };

  const selectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTags(tags.map(tag => tag.id));
    } else {
      setSelectedTags([]);
    }
  };

  const clearSelection = () => {
    setSelectedTags([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const bulkDeleteTags = async () => {
    if (selectedTags.length === 0) return;
    
    const count = selectedTags.length;
    const message = count === 1 
      ? 'Are you sure you want to delete this tag?' 
      : `Are you sure you want to delete ${count} tags?`;
    
    const confirmed = await confirmation.confirm({
      title: 'Delete Tags',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await bulkDeleteMutation.mutateAsync({ tagIds: selectedTags });
        setSelectedTags([]);
        showToast.success('Success', 'Tags deleted successfully');
      } catch (error) {
        console.error('Failed to delete tags:', error);
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
          <TagList
            tags={tags}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onEditTag={editTag}
            onDeleteTag={deleteTag}
            isDeleting={bulkDeleteMutation.isPending}
            deletingTagIds={bulkDeleteMutation.isPending ? (bulkDeleteMutation.variables?.tagIds || []) : []}
            selectedTags={selectedTags}
            onSelectTag={selectTag}
            onSelectAll={selectAll}
            onBulkDelete={bulkDeleteTags}
            onClearSelection={clearSelection}
            isBulkDeleting={bulkDeleteMutation.isPending}
            currentPage={currentPage}
            totalPages={metaData?.totalPages || 1}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            metaData={metaData}
          />
        </div>
      </div>

      <TagEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
      />

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ''}
        message={confirmation.config?.message || ''}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
