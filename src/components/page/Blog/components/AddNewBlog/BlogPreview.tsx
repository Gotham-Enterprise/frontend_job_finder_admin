"use client";
import React from "react";
import { BlogPost } from "@/services/types/blogPostType";

interface BlogPreviewProps {
  blogPost: BlogPost;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ blogPost }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-3">
          Preview Mode
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {blogPost.title || 'Untitled Post'}
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>Published on {new Date(blogPost.publishDate).toLocaleDateString()}</span>
          {blogPost.categories.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>Categories: {blogPost.categories.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      {blogPost.excerpt && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium">{blogPost.excerpt}</p>
        </div>
      )}
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div 
          className="text-gray-900 dark:text-white blog-preview-content"
          dangerouslySetInnerHTML={{ 
            __html: blogPost.content || '<p class="text-gray-500 italic">No content yet...</p>' 
          }}
        />
      </div>

      {blogPost.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPreview;
