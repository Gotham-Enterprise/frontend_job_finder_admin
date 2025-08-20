import React from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import SubCategoryDropdown from "@/components/form/SubCategoryDropdown";
import { Category, CategoryEditModalProps } from "@/services/types/categoryTypes";
import { useSubCategories } from "@/services/hooks/useSubCategories";

export default function CategoryEditModal({
  isOpen,
  onClose,
  editingCategory,
  setEditingCategory,
  onUpdateCategory,
  isUpdating = false
}: CategoryEditModalProps) {
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories();

  const updateSubCategories = (selectedSubCategories: Array<{ name: string; id?: string }>) => {
    // Since we only allow existing subcategories, all should have valid IDs
    const subcategoriesWithIds = selectedSubCategories.filter(subCat => subCat.id).map(subCat => ({
      id: subCat.id!,
      name: subCat.name
    }));
    
    setEditingCategory((prev: Category | null) => 
      prev ? { ...prev, subCategories: subcategoriesWithIds } : null
    );
  };

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
                <Label>Sub Categories</Label>
                <SubCategoryDropdown
                  selectedSubCategories={editingCategory.subCategories || []}
                  availableSubCategories={subCategories}
                  onSelectionChange={updateSubCategories}
                  placeholder="Search subcategories..."
                  maxSelections={10}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select from existing subcategories.
                </p>
                {isLoadingSubCategories && (
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    Loading subcategories...
                  </p>
                )}
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
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onUpdateCategory}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Category"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
