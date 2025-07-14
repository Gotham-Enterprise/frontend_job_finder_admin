/**
 * Complete Frontend Integration Example
 * How to use the professional blog system with AWS S3
 */

"use client";
import React, { useState, useCallback } from 'react';
import { ProfessionalBlogPayload, useBlogAPI, BlogPayloadValidator } from '@/services/api/imageService';

export default function ProfessionalBlogCreator() {
  const [blogData, setBlogData] = useState<Omit<ProfessionalBlogPayload, 'images'>>({
    title: '',
    permalink: '',
    excerpt: '',
    content: '',
    status: 'draft',
    visibility: 'public',
    publishDate: new Date().toISOString().split('T')[0],
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    social: {},
    categories: [],
    tags: [],
    allowComments: true,
    allowPings: true,
    featuredPost: false,
    authorId: 'current-user-id' // Replace with actual user ID
  });

  const [selectedImages, setSelectedImages] = useState<{
    featured?: File;
    content: Array<{ file: File; alt: string }>;
    gallery: Array<{ file: File; alt: string }>;
  }>({
    content: [],
    gallery: []
  });

  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { createBlogWithImages } = useBlogAPI();

  // Handle form changes
  const handleInputChange = useCallback((field: keyof typeof blogData, value: any) => {
    setBlogData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle nested field changes (SEO, social)
  const handleNestedChange = useCallback((parent: 'seo' | 'social', field: string, value: any) => {
    setBlogData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((type: 'featured' | 'content' | 'gallery', file: File, alt?: string) => {
    setSelectedImages(prev => {
      if (type === 'featured') {
        return { ...prev, featured: file };
      } else {
        return {
          ...prev,
          [type]: [...prev[type], { file, alt: alt || file.name }]
        };
      }
    });
  }, []);

  // Create blog with professional payload
  const handleCreateBlog = useCallback(async () => {
    setIsCreating(true);
    setErrors([]);

    try {
      // Validate data first
      const validation = BlogPayloadValidator.validate({
        ...blogData,
        images: { content: [], gallery: [] } // Temporary for validation
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsCreating(false);
        return;
      }

      // Prepare image files for upload
      const imageFiles: Array<{ file: File; type: 'featured' | 'content' | 'gallery'; alt: string }> = [];

      // Add featured image
      if (selectedImages.featured) {
        imageFiles.push({
          file: selectedImages.featured,
          type: 'featured',
          alt: 'Featured image for ' + blogData.title
        });
      }

      // Add content images
      selectedImages.content.forEach(img => {
        imageFiles.push({
          file: img.file,
          type: 'content',
          alt: img.alt
        });
      });

      // Add gallery images
      selectedImages.gallery.forEach(img => {
        imageFiles.push({
          file: img.file,
          type: 'gallery',
          alt: img.alt
        });
      });

      // Create blog with images
      const result = await createBlogWithImages(blogData, imageFiles);

      if (result.success) {
        // Success! Redirect or show success message
        alert(`Blog created successfully! ID: ${result.blogId}`);
        // router.push('/admin/blogs');
      } else {
        setErrors(result.errors || ['Unknown error occurred']);
      }

    } catch (error) {
      console.error('Blog creation failed:', error);
      setErrors(['Failed to create blog. Please try again.']);
    } finally {
      setIsCreating(false);
    }
  }, [blogData, selectedImages, createBlogWithImages]);

  return (
    <div className="mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Create Professional Blog Post
      </h1>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={blogData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Permalink *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/blog/</span>
              <input
                type="text"
                value={blogData.permalink}
                onChange={(e) => handleInputChange('permalink', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excerpt
            </label>
            <textarea
              value={blogData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your blog post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              value={blogData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your blog content here..."
            />
          </div>
        </div>
      </section>

      {/* Image Management */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {selectedImages.featured ? (
                <div>
                  <img
                    src={URL.createObjectURL(selectedImages.featured)}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <button
                    onClick={() => setSelectedImages(prev => ({ ...prev, featured: undefined }))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-gray-400 mb-2">📷</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect('featured', file);
                    }}
                    className="hidden"
                    id="featured-image"
                  />
                  <label
                    htmlFor="featured-image"
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    Upload Featured Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Images ({selectedImages.content.length})
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <div className="text-gray-400 mb-2">🖼️</div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageSelect('content', file));
                }}
                className="hidden"
                id="content-images"
              />
              <label
                htmlFor="content-images"
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                Upload Content Images
              </label>
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gallery Images ({selectedImages.gallery.length})
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <div className="text-gray-400 mb-2">🎨</div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageSelect('gallery', file));
                }}
                className="hidden"
                id="gallery-images"
              />
              <label
                htmlFor="gallery-images"
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                Upload Gallery Images
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Settings */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={blogData.seo.title}
              onChange={(e) => handleNestedChange('seo', 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SEO optimized title (max 60 characters)"
              maxLength={60}
            />
            <div className="text-xs text-gray-500 mt-1">
              {blogData.seo.title.length}/60 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SEO Description
            </label>
            <textarea
              value={blogData.seo.description}
              onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SEO meta description (max 160 characters)"
              maxLength={160}
            />
            <div className="text-xs text-gray-500 mt-1">
              {blogData.seo.description.length}/160 characters
            </div>
          </div>
        </div>
      </section>

      {/* Publishing Settings */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Publishing Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={blogData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <select
              value={blogData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="password">Password Protected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publish Date
            </label>
            <input
              type="date"
              value={blogData.publishDate}
              onChange={(e) => handleInputChange('publishDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Save as Draft
        </button>
        
        <button
          onClick={handleCreateBlog}
          disabled={isCreating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Blog Post'}
        </button>
      </div>

      {/* Professional Payload Preview (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
            View Payload Structure (Dev Only)
          </summary>
          <pre className="mt-4 text-xs overflow-auto">
            {JSON.stringify({
              ...blogData,
              images: {
                featured: selectedImages.featured ? { file: selectedImages.featured.name } : undefined,
                content: selectedImages.content.map(img => ({ file: img.file.name, alt: img.alt })),
                gallery: selectedImages.gallery.map(img => ({ file: img.file.name, alt: img.alt }))
              }
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
