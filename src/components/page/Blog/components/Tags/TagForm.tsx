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
}

const TagForm: React.FC<TagFormProps> = ({
  newTag,
  onInputChange,
  onAddTag,
  isCreating = false
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
            disabled={!newTag.name.trim() || isCreating}
          >
            {isCreating ? 'Adding...' : 'Add New Tag'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagForm;
