import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import SubCategoryDropdown from "@/components/form/SubCategoryDropdown";
import { CategoryFormProps } from "@/services/types/categoryTypes";
import { useSubCategories } from "@/services/hooks/useSubCategories";

export default function CategoryForm({
  newCategory,
  onInputChange,
  onAddCategory,
  onSubCategoryChange,
  isLoading = false
}: CategoryFormProps) {
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories();

  const currentSubCategories = newCategory.subCategories || [];

  const onSubCategoriesUpdate = (selectedSubCategories: Array<{ name: string; id?: string }>) => {
    if (onSubCategoryChange) {
      onSubCategoryChange(selectedSubCategories);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Category</h2>
      
      <div className="space-y-4">        
        <div>
          <Label>Name *</Label>
          <Input
            type="text"
            placeholder="Category name"
            defaultValue={newCategory.name}
            onChange={(e) => onInputChange('name', e.target.value)}
          />
        </div>        
         
        <div>
          <Label>Sub Categories</Label>
          <SubCategoryDropdown
            selectedSubCategories={currentSubCategories}
            availableSubCategories={subCategories}
            onSelectionChange={onSubCategoriesUpdate}
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
          <Label>Description</Label>
          <TextArea
            placeholder="Category description (optional)"
            rows={4}
            value={newCategory.description}
            onChange={(value) => onInputChange('description', value)}
          />
        </div>

        <Button
          variant="default"
          onClick={onAddCategory}
          className="w-full"
          disabled={!newCategory.name.trim() || isLoading}
        >
          {isLoading ? "Adding..." : "Add New Category"}
        </Button>
      </div>
    </div>
  );
}
