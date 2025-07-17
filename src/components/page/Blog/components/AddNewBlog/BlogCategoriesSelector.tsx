"use client";
import React from "react";
import MultiSelect from "@/components/form/MultiSelect";
import { CategoryOption } from "@/services/types/blogPostType";

interface BlogCategoriesSelectorProps {
  categories: string[];
  categoryOptions: CategoryOption[];
  onChange: (selected: string[]) => void;
}

const BlogCategoriesSelector: React.FC<BlogCategoriesSelectorProps> = ({
  categories,
  categoryOptions,
  onChange
}) => {
  return (
    <div className="bg-white dark:bg-white rounded-lg border border-gray-200 dark:border-gray-200 p-6">
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Categories</h3>     
       <MultiSelect
        label=""
        options={categoryOptions}
        defaultSelected={categories}
        onChange={(selected: string[]) => onChange(selected)}
        placeholder="Select categories..."
        maxDisplayItems={2}
      />
    </div>
  );
};

export default BlogCategoriesSelector;
