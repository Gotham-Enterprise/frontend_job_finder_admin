import React from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Category, CategoryEditModalProps } from "@/services/types/categoryTypes";

export default function CategoryEditModal({
  isOpen,
  onClose,
  editingCategory,
  setEditingCategory,
  onUpdateCategory,
  parentOptions
}: CategoryEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-20 rounded-lg"
    >
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Category</h3>
        <div className="space-y-4">
          {editingCategory && (
            <>
              <div>
                <Label htmlFor="editCategoryName">Name *</Label>
                <Input
                  id="editCategoryName"
                  type="text"
                  placeholder="Category name"
                  defaultValue={editingCategory.name}
                  onChange={(e) => setEditingCategory((prev: Category | null) => prev ? { ...prev, name: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editCategorySlug">Slug</Label>
                <Input
                  id="editCategorySlug"
                  type="text"
                  placeholder="category-slug"
                  defaultValue={editingCategory.slug}
                  onChange={(e) => setEditingCategory((prev: Category | null) => prev ? { ...prev, slug: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editCategoryParent">Parent Category</Label>
                <Select
                  options={parentOptions}
                  placeholder="None"
                  defaultValue={editingCategory.parent}
                  onChange={(value: string) => setEditingCategory((prev: Category | null) => prev ? { ...prev, parent: value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="editCategoryDescription">Description</Label>
                <TextArea
                  placeholder="Category description (optional)"
                  rows={4}
                  value={editingCategory.description}
                  onChange={(value: string) => setEditingCategory((prev: Category | null) => prev ? { ...prev, description: value } : null)}
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
                <Button onClick={onUpdateCategory}>
                  Update Category
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
