"use client";
import React from "react";
import { Tag } from "@/services/types/tagTypes";

interface PopularTagsProps {
  tags: Tag[];
  onEditTag: (tag: Tag) => void;
}

const PopularTags: React.FC<PopularTagsProps> = ({ tags, onEditTag }) => {
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {sortedTags.slice(0, 10).map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            onClick={() => onEditTag(tag)}
          >
            {tag.name}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {tag.count}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PopularTags;
