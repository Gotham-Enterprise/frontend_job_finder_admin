"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";

import { 
  BlogLayout, 
  LayoutBlock,
  convertLayoutToBlogPayload, 
} from "@/services/types/visualLayoutTypes";

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


const createInitialLayout = (): BlogLayout => {
  return {
    id: `layout-${Date.now()}`,
    name: 'New Blog Post',
    blocks: [
      {
        id: 'demo-heading-1',
        type: 'heading',
        content: {
          text: 'Gotham Visual Layout Builder',
          level: 1,
        },
        styles: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          textColor: '#1f2937',
          margin: { top: 0, right: 0, bottom: 24, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        position: { x: 0, y: 0, width: 100, height: 80 },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      },
      {
        id: 'demo-paragraph-1',
        type: 'paragraph',
        content: {
          text: 'Click on any block to see the floating style controls. Try clicking the Style buttons on the right to see the floating panels in action!',
          richText: true,
        },
        styles: {
          fontSize: '1.125rem',
          textAlign: 'center',
          textColor: '#4b5563',
          margin: { top: 0, right: 0, bottom: 32, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        position: { x: 0, y: 0, width: 100, height: 80 },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      },
      {
        id: 'demo-image-1',
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
          alt: 'Demo image of a laptop with code',
          size: 'large',
          aspectRatio: '16:9',
        },
        styles: {
          margin: { top: 0, right: 0, bottom: 24, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 12 },
        },
        position: { x: 0, y: 0, width: 100, height: 300 },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      }
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

  const [currentLayout, setCurrentLayout] = useState<BlogLayout>(createInitialLayout());
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  

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

  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });

  const previewModal = useModal();

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

  const updateLayout = useCallback((blocks: LayoutBlock[]) => {
    setCurrentLayout(prev => ({
      ...prev,
      blocks,
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
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

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { text: 'New Heading', level: 2 };
      case 'paragraph':
        return { text: 'Type your content here...', richText: true };
      case 'image':
        return { url: '', alt: 'Image description', caption: '' };
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
      case 'column':
        return { 
          columnCount: 2, 
          columns: [
            { contentType: 'text', content: 'Column 1 content' },
            { contentType: 'text', content: 'Column 2 content' }
          ],
          gap: 16
        };
      case 'gallery':
        return { images: [], layout: 'grid' };
      case 'hero':
        return { title: 'Hero Title', subtitle: 'Hero subtitle' };
      case 'embed':
        return { code: '', type: 'html' };
      case 'button':
        return { 
          text: 'Click Me', 
          url: '', 
          target: '_self', 
          variant: 'primary', 
          size: 'medium',
          width: 'auto',
          customWidth: 200,
          alignment: 'left'
        };
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
      case 'button':
        return {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          fontSize: '1rem',
          fontWeight: '500',
          textAlign: 'center' as const,
          padding: { top: 12, right: 24, bottom: 12, left: 24 },
          margin: { top: 0, right: 0, bottom: 16, left: 0 },
          border: { width: 0, style: 'solid', color: 'transparent', radius: 6 },
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
      case 'column': return 150;
      case 'gallery': return 300;
      case 'hero': return 250;
      case 'embed': return 200;
      case 'button': return 48;
      default: return 100;
    }
  };

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

           

          
            </div>
          </div>

          {/* Center Canvas - Visual Layout Builder */}
          <div className="flex-1 relative h-full bg-gray-100 dark:bg-gray-900">
            <VisualLayoutBuilder
              initialLayout={currentLayout.blocks}
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
