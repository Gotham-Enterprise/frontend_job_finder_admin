"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { NewTag } from "@/services/api/tag";

interface TagFormProps {
  newTag: NewTag;
  onInputChange: (field: keyof NewTag, value: string) => void;
  onAddTag: () => void;
  isCreating?: boolean;
  existingTags?: Array<{ name: string }>;
}

const TagForm: React.FC<TagFormProps> = ({
  newTag,
  onInputChange,
  onAddTag,
  isCreating = false,
  existingTags = []
}) => {
  const isDuplicate = existingTags.some(tag => 
    tag.name.toLowerCase().trim() === newTag.name.toLowerCase().trim()
  );
  
  const isDisabled = !newTag.name.trim() || isDuplicate || isCreating;
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
            className={isDuplicate && newTag.name.trim() ? 'border-red-500 focus:border-red-500' : ''}
          />
          {isDuplicate && newTag.name.trim() && (
            <p className="text-red-500 text-sm mt-1">A tag with this name already exists</p>
          )}
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

        <div>
          <Button
            variant="default"
            onClick={onAddTag}
            className="w-full"
            disabled={isDisabled}
          >
            {isCreating ? 'Adding...' : 'Add New Tag'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagForm;
