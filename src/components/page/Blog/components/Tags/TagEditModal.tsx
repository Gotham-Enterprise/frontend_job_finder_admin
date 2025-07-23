"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { Tag, NewTag } from "@/services/api/tag";
import { useUpdateTag } from "@/services/hooks/useTags";
import { showToast } from "@/services/utils/toast";

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTag: Tag | null;
  setEditingTag: React.Dispatch<React.SetStateAction<Tag | null>>;
}

const TagEditModal: React.FC<TagEditModalProps> = ({
  isOpen,
  onClose,
  editingTag,
  setEditingTag
}) => {
  const [formData, setFormData] = useState<NewTag>({
    name: '',
    description: ''
  });

  const updateTagMutation = useUpdateTag();
  const isUpdating = updateTagMutation.isPending;

  useEffect(() => {
    if (editingTag) {
      setFormData({
        name: editingTag.name,
        description: editingTag.description
      });
    }
  }, [editingTag]);

  const updateTag = async () => {
    if (!editingTag || !formData.name.trim()) {
      showToast.error('Validation Error', 'Tag name is required');
      return;
    }

    try {
      const response = await updateTagMutation.mutateAsync({
        id: editingTag.id,
        data: formData
      });
      
      if (response.success) {
        showToast.success('Success', 'Tag updated successfully');
        onClose();
        setEditingTag(null);
      } else {
        showToast.error('Error', response.message || 'Failed to update tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      showToast.error('Error', 'Failed to update tag');
    }
  };

  const closeModal = () => {
    onClose();
    setEditingTag(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-20 rounded-lg"
    >
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Tag</h3>
        <div className="space-y-4">
          {editingTag && (
            <>
              <div>
                <Label htmlFor="editTagName">Name *</Label>
                <Input
                  id="editTagName"
                  type="text"
                  placeholder="Tag name"
                  defaultValue={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editTagDescription">Description</Label>
                <TextArea
                  placeholder="Tag description (optional)"
                  rows={4}
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="dark:text-white"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateTag}
                  disabled={!formData.name.trim() || isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Tag'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TagEditModal;
