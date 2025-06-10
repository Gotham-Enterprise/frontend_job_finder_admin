"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { NewTag } from "@/services/types/tagTypes";

interface TagFormProps {
  newTag: NewTag;
  onInputChange: (field: keyof NewTag, value: string) => void;
  onAddTag: () => void;
  onBulkModalOpen: () => void;
}

const TagForm: React.FC<TagFormProps> = ({
  newTag,
  onInputChange,
  onAddTag,
  onBulkModalOpen
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Tag</h2>
      
      <div className="space-y-4">
        <div>
          <Label>Name *</Label>
          <Input
            type="text"
            placeholder="Tag name"
            defaultValue={newTag.name}
            onChange={(e) => onInputChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label>Slug</Label>
          <Input
            type="text"
            placeholder="tag-slug"
            defaultValue={newTag.slug}
            onChange={(e) => onInputChange('slug', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The "slug" is the URL-friendly version of the name.
          </p>
        </div>

        <div>
          <Label>Description</Label>
          <TextArea
            placeholder="Tag description (optional)"
            rows={4}
            value={newTag.description}
            onChange={(value) => onInputChange('description', value)}
          />
        </div>

        <div className="space-y-2">
          <Button
            variant="default"
            onClick={onAddTag}
            className="w-full"
            disabled={!newTag.name.trim()}
          >
            Add New Tag
          </Button>
          
          <Button
            variant="outline"
            onClick={onBulkModalOpen}
            className="w-full dark:text-white"
          >
            Bulk Add Tags
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagForm;
