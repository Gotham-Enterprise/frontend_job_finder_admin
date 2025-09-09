"use client";

import React from 'react';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface BlogDropdownProps {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

const BlogDropdown: React.FC<BlogDropdownProps> = ({
  label,
  value,
  isOpen,
  onToggle,
  children,
  className = ""
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {label}:
      </label>
      <div className={`relative dropdown-container ${className}`}>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
        >
          <span>{value}</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && children}
      </div>
    </div>
  );
};

export default BlogDropdown;
