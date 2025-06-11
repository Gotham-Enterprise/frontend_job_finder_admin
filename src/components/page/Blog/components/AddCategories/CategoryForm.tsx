import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { CategoryFormProps } from "@/services/types/categoryTypes";

export default function CategoryForm({
  newCategory,
  onInputChange,
  onAddCategory,
  parentOptions
}: CategoryFormProps) {
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
          <Label>Slug</Label>
          <Input
            key={newCategory.slug} 
            type="text"
            placeholder="category-slug"
            defaultValue={newCategory.slug}
            onChange={(e) => onInputChange('slug', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The &quot;slug&quot; is the URL-friendly version of the name.
          </p>
        </div>        <div>
          <Label>Parent Category</Label>
          <Select
            options={parentOptions}
            placeholder="None"
            defaultValue={newCategory.parent}
            onChange={(value) => onInputChange('parent', value)}
          />
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
          disabled={!newCategory.name.trim()}
        >
          Add New Category
        </Button>
      </div>
    </div>
  );
}
