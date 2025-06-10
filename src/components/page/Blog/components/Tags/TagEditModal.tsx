"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { Tag } from "@/services/types/tagTypes";

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTag: Tag | null;
  setEditingTag: React.Dispatch<React.SetStateAction<Tag | null>>;
  onUpdateTag: () => void;
}

const TagEditModal: React.FC<TagEditModalProps> = ({
  isOpen,
  onClose,
  editingTag,
  setEditingTag,
  onUpdateTag
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
                  defaultValue={editingTag.name}
                  onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editTagSlug">Slug</Label>
                <Input
                  id="editTagSlug"
                  type="text"
                  placeholder="tag-slug"
                  defaultValue={editingTag.slug}
                  onChange={(e) => setEditingTag(prev => prev ? { ...prev, slug: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editTagDescription">Description</Label>
                <TextArea
                  placeholder="Tag description (optional)"
                  rows={4}
                  value={editingTag.description}
                  onChange={(value) => setEditingTag(prev => prev ? { ...prev, description: value } : null)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="dark:text-white"
                >
                  Cancel
                </Button>
                <Button onClick={onUpdateTag}>
                  Update Tag
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
