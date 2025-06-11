"use client";
import React from "react";
import RichTextEditor from "@/components/form/input/RichTextEditor";

interface BlogContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  activeTab: 'write' | 'preview';
  onTabChange: (tab: 'write' | 'preview') => void;
  renderPreview: () => React.ReactNode;
}

const BlogContentEditor: React.FC<BlogContentEditorProps> = ({
  content,
  onChange,
  activeTab,
  onTabChange,
  renderPreview
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => onTabChange('write')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'write'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => onTabChange('preview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Preview
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        <div className={activeTab === 'write' ? 'block' : 'hidden'}>
          <RichTextEditor
            key="blog-editor"
            content={content}
            onChange={onChange}
            placeholder="Tell your story... Use the toolbar above to format text, add images, and create rich content."
            minHeight={500}
          />
        </div>
        {activeTab === 'preview' && (
          <div className="min-h-[500px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogContentEditor;
