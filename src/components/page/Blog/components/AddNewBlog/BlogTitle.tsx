"use client";
import React from "react";
import Input from "@/components/form/input/InputField";

interface BlogTitleProps {
  title: string;
  onChange: (title: string) => void;
}

const BlogTitle: React.FC<BlogTitleProps> = ({ title, onChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <Input
        type="text"
        placeholder="Enter title here"
        defaultValue={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="text-2xl font-semibold border-none shadow-none focus:ring-0 p-0 bg-transparent"
      />
    </div>
  );
};

export default BlogTitle;
