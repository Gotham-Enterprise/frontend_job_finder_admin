"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";

interface BlogSEOSettingsProps {
  seoTitle: string;
  seoDescription: string;
  showSEOSettings: boolean;
  onToggleShow: () => void;
  onSeoTitleChange: (title: string) => void;
  onSeoDescriptionChange: (description: string) => void;
}

const BlogSEOSettings: React.FC<BlogSEOSettingsProps> = ({
  seoTitle,
  seoDescription,
  showSEOSettings,
  onToggleShow,
  onSeoTitleChange,
  onSeoDescriptionChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggleShow}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h3 className="text-base font-medium text-gray-900 dark:text-white">SEO Settings</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${showSEOSettings ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showSEOSettings && (
        <div className="px-6 pb-6 space-y-4">
          <div>
            <Label>SEO Title</Label>
            <Input
              type="text"
              placeholder="SEO title"
              defaultValue={seoTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSeoTitleChange(e.target.value)}
            />
          </div>
          <div>
            <Label>SEO Description</Label>
            <TextArea
              placeholder="SEO description"
              rows={3}
              value={seoDescription}
              onChange={(value: string) => onSeoDescriptionChange(value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSEOSettings;
