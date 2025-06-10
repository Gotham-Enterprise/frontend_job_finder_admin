"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import { generateSlug, sanitizePermalink } from "@/services/utils";

interface BlogTitleProps {
  title: string;
  permalink: string;
  onChange: (title: string) => void;
  onPermalinkChange: (permalink: string) => void;
}

const BlogTitle: React.FC<BlogTitleProps> = ({ 
  title, 
  permalink, 
  onChange, 
  onPermalinkChange 
}) => {
  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);
  const [permalinkInput, setPermalinkInput] = useState(permalink);

  useEffect(() => {
    if (title && !isPermalinkManuallyEdited) {
      const newPermalink = generateSlug(title);
      setPermalinkInput(newPermalink);
      onPermalinkChange(newPermalink);
    }
  }, [title, isPermalinkManuallyEdited, onPermalinkChange]);

  useEffect(() => {
    setPermalinkInput(permalink);
  }, [permalink]);  const handlePermalinkChange = (value: string) => {
    setIsPermalinkManuallyEdited(true);
    const sanitizedValue = sanitizePermalink(value);
    setPermalinkInput(sanitizedValue);
    onPermalinkChange(sanitizedValue);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <Input
        type="text"
        placeholder="Enter title"
        defaultValue={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="text-2xl font-semibold border-none shadow-none focus:ring-0 p-0 bg-transparent"
      />
      
      <div className="flex flex-grow items-center w-full gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Permalink:
        </label>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
            {typeof window !== 'undefined' ? window.location.origin : ''}/blog/
          </span>          
          <input
            type="text"
            placeholder="post-slug"
            value={permalinkInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePermalinkChange(e.target.value)}
            className="text-sm border-none w-full shadow-none focus:ring-0 p-0 bg-transparent text-blue-600 dark:text-blue-400 w-full outline-none"
          />
        </div>       
       
      </div>
    </div>
  );
};

export default BlogTitle;
