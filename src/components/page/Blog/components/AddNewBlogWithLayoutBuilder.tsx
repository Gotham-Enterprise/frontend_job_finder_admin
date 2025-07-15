"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";

import { 
  BlogLayout, 
  convertLayoutToBlogPayload, 
  LAYOUT_PRESETS 
} from "@/services/types/visualLayoutTypes";
import { 
  CreateBlogPostPayload 
} from "@/services/types/blogPayload";
import { 
  CategoryOption, 
  TagOption 
} from "@/services/types/blogPostType";

interface BlogMetadata {
  title: string;
  permalink: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  allowPings: boolean;
}

type ViewMode = 'builder' | 'classic' | 'preview';

// Helper function to create a simple initial layout
const createInitialLayout = (): BlogLayout => {
  return {
    id: `layout-${Date.now()}`,
    name: 'New Blog Post',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Your Blog Title Here',
          subtitle: 'Add a compelling subtitle',
        },
        styles: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: { top: 20, right: 0, bottom: 20, left: 0 },
          padding: { top: 40, right: 20, bottom: 40, left: 20 },
        },
        position: { x: 0, y: 0, width: 100, height: 200 },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      },
      {
        id: 'paragraph-1',
        type: 'paragraph',
        content: {
          text: 'Start writing your blog content here. You can edit this text directly or use the sidebar controls.',
          richText: true,
        },
        styles: {
          fontSize: '1.1rem',
          margin: { top: 0, right: 0, bottom: 20, left: 0 },
        },
        position: { x: 0, y: 200, width: 100, height: 100 },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      },
    ],
    settings: {
      maxWidth: 800,
      backgroundColor: '#ffffff',
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      version: '1.0.0',
    },
  };
};

export default function AddNewBlogWithLayoutBuilder() {
  // Layout and content state
  const [currentLayout, setCurrentLayout] = useState<BlogLayout>(createInitialLayout());
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  
  // Blog metadata state
  const [metadata, setMetadata] = useState<BlogMetadata>({
    title: '',
    permalink: '',
    excerpt: '',
    status: 'draft',
    visibility: 'public',
    password: '',
    publishDate: new Date().toISOString().split('T')[0],
    categories: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    allowComments: true,
    allowPings: true,
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });

  const previewModal = useModal();

  // Sample options (in real app, these would come from API)
  const categoryOptions: CategoryOption[] = [
    { value: '1', text: 'Technology', selected: false },
    { value: '2', text: 'Design', selected: false },
    { value: '3', text: 'Business', selected: false },
    { value: '4', text: 'Marketing', selected: false },
    { value: '5', text: 'Development', selected: false },
    { value: '6', text: 'Tutorial', selected: false },
    { value: '7', text: 'News', selected: false },
  ];

  const tagOptions: TagOption[] = [
    { value: '1', text: 'React', selected: false },
    { value: '2', text: 'TypeScript', selected: false },
    { value: '3', text: 'JavaScript', selected: false },
    { value: '4', text: 'CSS', selected: false },
    { value: '5', text: 'Next.js', selected: false },
    { value: '6', text: 'Node.js', selected: false },
    { value: '7', text: 'API', selected: false },
    { value: '8', text: 'Frontend', selected: false },
    { value: '9', text: 'Backend', selected: false },
    { value: '10', text: 'UI/UX', selected: false },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'private', label: 'Private' },
  ];

  // Handlers
  const updateMetadata = useCallback((field: keyof BlogMetadata, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setMetadata(prev => ({
      ...prev,
      title,
      permalink: title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
  }, []);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const updateLayout = useCallback((layout: BlogLayout) => {
    setCurrentLayout(layout);
  }, []);

  const saveBlog = useCallback(async (isDraft = true) => {
    try {
      const layoutPayload = convertLayoutToBlogPayload(currentLayout, metadata.title);
      console.log('Saving blog post:', layoutPayload);
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  }, [currentLayout, metadata]);

  const previewBlog = useCallback(() => {
    previewModal.openModal();
  }, [previewModal]);

  const addElement = useCallback((type: string) => {
    const newBlock: any = {
      id: `${type}-${Date.now()}`,
      type: type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { 
        x: 0, 
        y: currentLayout.blocks.length * 100, 
        width: 100, 
        height: getDefaultHeight(type) 
      },
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };

    setCurrentLayout(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, [currentLayout.blocks.length]);

  // Helper functions for default content
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { text: 'New Heading', level: 2 };
      case 'paragraph':
        return { text: 'Type your content here...', richText: true };
      case 'image':
        return { src: '', alt: 'Image description', caption: '' };
      case 'quote':
        return { text: 'Inspiring quote goes here...', author: '' };
      case 'list':
        return { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
      case 'code':
        return { code: '// Your code here', language: 'javascript' };
      case 'spacer':
        return { height: 40 };
      case 'columns':
        return { columns: 2, content: ['Column 1', 'Column 2'] };
      case 'gallery':
        return { images: [], layout: 'grid' };
      case 'hero':
        return { title: 'Hero Title', subtitle: 'Hero subtitle' };
      case 'embed':
        return { code: '', type: 'html' };
      default:
        return { text: 'New element' };
    }
  };

  const getDefaultStyles = (type: string) => {
    const baseStyles = {
      margin: { top: 10, right: 0, bottom: 10, left: 0 },
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
    };

    switch (type) {
      case 'heading':
        return { ...baseStyles, fontSize: '1.8rem', fontWeight: 'bold' };
      case 'spacer':
        return { ...baseStyles, padding: { top: 0, right: 0, bottom: 0, left: 0 } };
      case 'hero':
        return { 
          ...baseStyles, 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          textAlign: 'center' as const,
          padding: { top: 40, right: 20, bottom: 40, left: 20 }
        };
      default:
        return baseStyles;
    }
  };

  const getDefaultHeight = (type: string) => {
    switch (type) {
      case 'heading': return 60;
      case 'paragraph': return 100;
      case 'image': return 200;
      case 'quote': return 120;
      case 'list': return 120;
      case 'code': return 150;
      case 'spacer': return 40;
      case 'columns': return 200;
      case 'gallery': return 300;
      case 'hero': return 250;
      case 'embed': return 200;
      default: return 100;
    }
  };

  // Check if we can save (title is required)
  const canSave = metadata.title.trim().length > 0;

  return (
    <>
      {/* Full-screen overlay that covers everything including the admin header */}
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900">
        {/* Custom header for blog creation */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Blog Post</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create content with our visual layout builder</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Draft auto-saved</span>
            <Button
              variant="secondary"
              onClick={previewBlog}
              disabled={!canSave}
              className="px-4 py-2"
            >
              Preview
            </Button>
            <Button
              onClick={saveBlog}
              disabled={!canSave}
              className="px-4 py-2"
            >
              Add Blog
            </Button>
          </div>
        </div>
        
        {/* Main content area - Webflow style layout */}
        <div className="h-[calc(100vh-64px)] flex">
          {/* Left Sidebar - Element Library */}
          <div className="w-64 bg-gray-900 text-white border-r border-gray-700 overflow-y-auto h-full">
            <div className="p-4">
              {/* Blog Settings Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Blog Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Title *</label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => updateTitle(e.target.value)}
                      placeholder="Enter blog title..."
                      className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                      value={metadata.status}
                      onChange={(e) => updateMetadata('status', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visibility</label>
                    <select
                      value={metadata.visibility}
                      onChange={(e) => updateMetadata('visibility', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="password">Password Protected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Categories</label>
                  <div className="max-h-32 overflow-y-auto bg-gray-800 border border-gray-600 rounded p-2 space-y-1">
                    {categoryOptions.map(category => (
                      <label key={category.value} className="flex items-center text-xs cursor-pointer hover:bg-gray-700 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={metadata.categories.includes(category.value)}
                          onChange={(e) => {
                            const currentCategories = metadata.categories;
                            const newCategories = e.target.checked
                              ? [...currentCategories, category.value]
                              : currentCategories.filter(c => c !== category.value);
                            updateMetadata('categories', newCategories);
                          }}
                          className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-300">{category.text}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select multiple categories</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Tags</label>
                  <div className="max-h-32 overflow-y-auto bg-gray-800 border border-gray-600 rounded p-2 space-y-1">
                    {tagOptions.map(tag => (
                      <label key={tag.value} className="flex items-center text-xs cursor-pointer hover:bg-gray-700 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={metadata.tags.includes(tag.value)}
                          onChange={(e) => {
                            const currentTags = metadata.tags;
                            const newTags = e.target.checked
                              ? [...currentTags, tag.value]
                              : currentTags.filter(t => t !== tag.value);
                            updateMetadata('tags', newTags);
                          }}
                          className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-300">{tag.text}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select multiple tags</p>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => toggleSection('seo')}
                  className="flex items-center justify-between w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-white">SEO Settings</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedSections.seo ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.seo && (
                  <div className="space-y-3 px-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={metadata.seoTitle}
                        onChange={(e) => updateMetadata('seoTitle', e.target.value)}
                        placeholder="Leave empty to use blog title"
                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                      <textarea
                        value={metadata.seoDescription}
                        onChange={(e) => updateMetadata('seoDescription', e.target.value)}
                        placeholder="Brief description for search engines..."
                        rows={3}
                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Permalink</label>
                      <input
                        type="text"
                        value={metadata.permalink}
                        onChange={(e) => updateMetadata('permalink', e.target.value)}
                        placeholder="post-url-slug"
                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('settings')}
                  className="flex items-center justify-between w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-white">Advanced Settings</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedSections.settings ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.settings && (
                  <div className="space-y-3 px-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Publish Date</label>
                      <input
                        type="date"
                        value={metadata.publishDate}
                        onChange={(e) => updateMetadata('publishDate', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={metadata.allowComments}
                          onChange={(e) => updateMetadata('allowComments', e.target.checked)}
                          className="mr-2 text-blue-500"
                        />
                        <span className="text-gray-300">Allow Comments</span>
                      </label>

                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={metadata.allowPings}
                          onChange={(e) => updateMetadata('allowPings', e.target.checked)}
                          className="mr-2 text-blue-500"
                        />
                        <span className="text-gray-300">Allow Pingbacks</span>
                      </label>
                    </div>

                    {metadata.visibility === 'password' && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Password</label>
                        <input
                          type="password"
                          value={metadata.password}
                          onChange={(e) => updateMetadata('password', e.target.value)}
                          placeholder="Enter password..."
                          className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Canvas - Visual Layout Builder */}
          <div className="flex-1 relative h-full bg-gray-100 dark:bg-gray-900">
            <VisualLayoutBuilder
              initialLayout={currentLayout}
              onLayoutChange={updateLayout}
              onSave={saveBlog}
              blogData={metadata}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.closeModal}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Blog Preview</h2>
          <div className="text-gray-600">Preview content will be displayed here</div>
        </div>
      </Modal>
    </>
  );
}
