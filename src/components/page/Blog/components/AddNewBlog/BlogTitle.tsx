"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  const [origin, setOrigin] = useState('');
  

  const previousTitleRef = useRef(title);
  const previousPermalinkRef = useRef(permalink);
  const onPermalinkChangeRef = useRef(onPermalinkChange);


  useEffect(() => {
    onPermalinkChangeRef.current = onPermalinkChange;
  }, [onPermalinkChange]);


  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);


  const shouldUpdatePermalink = useMemo(() => {
    return permalink !== previousPermalinkRef.current && 
           permalink !== permalinkInput && 
           !isPermalinkManuallyEdited;
  }, [permalink, permalinkInput, isPermalinkManuallyEdited]);

  useEffect(() => {
    if (shouldUpdatePermalink) {
      setPermalinkInput(permalink);
      previousPermalinkRef.current = permalink;
    }
  }, [shouldUpdatePermalink, permalink]);


  useEffect(() => {
    const currentTitle = title.trim();
    const previousTitle = previousTitleRef.current;
    
    if (currentTitle !== previousTitle && !isPermalinkManuallyEdited) {
      if (currentTitle) {
        const newPermalink = generateSlug(currentTitle);
        setPermalinkInput(newPermalink);
        onPermalinkChangeRef.current(newPermalink);
      } else if (previousTitle) {
      
        setPermalinkInput('');
        onPermalinkChangeRef.current('');
      }
    }
    
    previousTitleRef.current = currentTitle;
  }, [title, isPermalinkManuallyEdited]);


  const titleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const permalinkChange = useCallback((value: string) => {
    setIsPermalinkManuallyEdited(true);
    const sanitizedValue = sanitizePermalink(value);
    setPermalinkInput(sanitizedValue);
    onPermalinkChangeRef.current(sanitizedValue);
  }, []);

  const permalinkInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    permalinkChange(e.target.value);
  }, [permalinkChange]);

  const originDisplay = useMemo(() => `${origin}/blog/`, [origin]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">      <Input
        type="text"
        placeholder="Enter title"
        defaultValue={title}
        onChange={titleChange}
        className="text-2xl font-semibold border-none shadow-none focus:ring-0 p-0 bg-transparent"
      />
      
      <div className="flex flex-grow items-center w-full gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Permalink:
        </label>        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
            {originDisplay}
          </span>
          <input
            type="text"
            placeholder="post-slug"
            value={permalinkInput}
            onChange={permalinkInputChange}
            className="text-sm border-none w-full shadow-none focus:ring-0 p-0 bg-transparent text-blue-600 dark:text-blue-400 outline-none"
          />
        </div>       
      </div>
    </div>
  );
};

export default BlogTitle;
