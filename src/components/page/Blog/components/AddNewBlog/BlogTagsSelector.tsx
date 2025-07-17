"use client";
import React from "react";
import MultiSelect from "@/components/form/MultiSelect";
import { TagOption } from "@/services/types/blogPostType";

interface BlogTagsSelectorProps {
  tags: string[];
  tagOptions: TagOption[];
  onChange: (selected: string[]) => void;
}

const BlogTagsSelector: React.FC<BlogTagsSelectorProps> = ({
  tags,
  tagOptions,
  onChange
}) => {
  return (
    <div className="bg-white dark:bg-white rounded-lg border border-gray-200 dark:border-gray-200 p-6">
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Tags</h3>      
      <MultiSelect
        label=""
        options={tagOptions}
        defaultSelected={tags}
        onChange={(selected: string[]) => onChange(selected)}
        placeholder="Select tags..."
        maxDisplayItems={3}
      />
    </div>
  );
};

export default BlogTagsSelector;
