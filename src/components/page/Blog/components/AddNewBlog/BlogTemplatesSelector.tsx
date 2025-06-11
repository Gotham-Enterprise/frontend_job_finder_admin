"use client";
import React, { useState } from "react";
import { ContentTemplate, TemplateCategory } from "@/services/types/blogPostType";
import { templateCategories, insertTemplateIntoEditor } from "@/services/utils/contentTemplates";

interface BlogTemplatesSelectorProps {
  onTemplateSelect: (content: string) => void;
  currentContent: string;
}

const BlogTemplatesSelector: React.FC<BlogTemplatesSelectorProps> = ({
  onTemplateSelect,
  currentContent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('layout');

  const templateSelect = (template: ContentTemplate) => {
    const newContent = insertTemplateIntoEditor(template, currentContent);
    onTemplateSelect(newContent);
    setIsExpanded(false);
  };

  const activeTemplates = templateCategories.find(cat => cat.id === activeCategory)?.templates || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-sm">📋</span>
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Content Templates</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose from predefined layouts</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
       
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeCategory === category.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>


          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => templateSelect(template)}
                  className="relative group cursor-pointer border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all"
                >
                 
                  <div className="flex items-center justify-center h-16 bg-gray-50 dark:bg-gray-700 rounded-md mb-3">
                    <span className="text-2xl">{template.preview}</span>
                  </div>
                  
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

               
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Click to Insert
                    </span>
                  </div>
                </div>
              ))}
            </div>

           
            {activeTemplates.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-gray-400 text-xl">📋</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No templates available in this category
                </p>
              </div>
            )}

          
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 <strong>Tip:</strong> Templates will be inserted into your editor where you can customize the content and replace image placeholders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTemplatesSelector;
