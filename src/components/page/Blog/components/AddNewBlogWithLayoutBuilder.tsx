"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";

import { 
  BlogLayout, 
  LayoutBlock,
  convertLayoutToBlogPayload,
  BlockType,
  BLOCK_TEMPLATES
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  

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

  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);

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
    { value: 'draft', label: 'Draft', description: 'This job posting will no longer be publicly accessible.' },
    { value: 'published', label: 'Published', description: 'This job posting can be viewed by anyone who has the link.' },
    { value: 'pending', label: 'Pending Review', description: 'This job posting is waiting for review before being published.' },
    { value: 'private', label: 'Private', description: 'This job posting is only visible to you and selected users.' },
  ];

  // Filtered categories and tags based on search terms
  const filteredCategories = categoryOptions.filter(category =>
    category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
  );

  const filteredTags = tagOptions.filter(tag =>
    tag.text.toLowerCase().includes(tagsSearchTerm.toLowerCase())
  );


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

  const addElement = useCallback((type: BlockType) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock: LayoutBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template,
      styles: template.styles || {},
      content: template.content || {},
      position: template.position || { x: 0, y: 0, width: 100, height: 100 },
    } as LayoutBlock;

    setCurrentLayout(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, []);

  const canSave = metadata.title.trim().length > 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setStatusDropdownOpen(false);
        setVisibilityDropdownOpen(false);
        setDateDropdownOpen(false);
        setCategoriesDropdownOpen(false);
        setTagsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <div className="flex items-center space-x-6">
              <div className="ml-4 flex items-center space-x-3">
                <label htmlFor="blog-title" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Blog Title:
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={metadata.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                  className="w-80 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                />
              </div>
              
              {/* Status Field */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Status:
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusDropdownOpen(!statusDropdownOpen);
                      setVisibilityDropdownOpen(false);
                      setDateDropdownOpen(false);
                      setCategoriesDropdownOpen(false);
                      setTagsDropdownOpen(false);
                    }}
                    className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                  >
                    <span>{statusOptions.find(option => option.value === metadata.status)?.label || 'Draft'}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            updateMetadata('status', option.value);
                            setStatusDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {metadata.status === option.value ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="w-4 h-4"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visibility Field */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Visibility:
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setVisibilityDropdownOpen(!visibilityDropdownOpen);
                      setStatusDropdownOpen(false);
                      setDateDropdownOpen(false);
                      setCategoriesDropdownOpen(false);
                      setTagsDropdownOpen(false);
                    }}
                    className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                  >
                    <span className="capitalize">{metadata.visibility}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {visibilityDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                      <button
                        type="button"
                        onClick={() => {
                          updateMetadata('visibility', 'public');
                          setVisibilityDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {metadata.visibility === 'public' ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Public</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">This blog post can be viewed by anyone who has the link.</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateMetadata('visibility', 'private');
                          setVisibilityDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {metadata.visibility === 'private' ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Private</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">This blog post is only visible to you and selected users.</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateMetadata('visibility', 'password');
                          setVisibilityDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {metadata.visibility === 'password' ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Password Protected</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">This blog post requires a password to view.</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Posted Field */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Date Posted:
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setDateDropdownOpen(!dateDropdownOpen);
                      setStatusDropdownOpen(false);
                      setVisibilityDropdownOpen(false);
                      setCategoriesDropdownOpen(false);
                      setTagsDropdownOpen(false);
                    }}
                    className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px]"
                  >
                    <span>{metadata.publishDate || '2025-07-21'}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dateDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3 mb-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Publication Date</span>
                        </div>
                        <div className="mb-4">
                          <DatePicker
                            id="blog-publish-date"
                            defaultDate={metadata.publishDate}
                            onChange={(selectedDates) => {
                              if (selectedDates.length > 0) {
                                const selectedDate = selectedDates[0];
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                updateMetadata('publishDate', formattedDate);
                              }
                            }}
                            placeholder="Select date"
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Choose when this blog post should be published.
                        </div>
                        <button
                          type="button"
                          onClick={() => setDateDropdownOpen(false)}
                          className="w-full bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories Field */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Categories:
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriesDropdownOpen(!categoriesDropdownOpen);
                      setStatusDropdownOpen(false);
                      setVisibilityDropdownOpen(false);
                      setDateDropdownOpen(false);
                      setTagsDropdownOpen(false);
                    }}
                    className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                  >
                    <span>{metadata.categories.length > 0 ? `${metadata.categories.length} selected` : 'Select'}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {categoriesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3 mb-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Categories</span>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mb-3 relative">
                          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categoriesSearchTerm}
                            onChange={(e) => setCategoriesSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map(category => (
                              <label key={category.value} className="flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
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
                                  className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-900 dark:text-gray-100">{category.text}</span>
                                {metadata.categories.includes(category.value) && (
                                  <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No categories found matching "{categoriesSearchTerm}"
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Select multiple categories for better organization.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriesDropdownOpen(false);
                            setCategoriesSearchTerm('');
                          }}
                          className="w-full bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Field */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Tags:
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setTagsDropdownOpen(!tagsDropdownOpen);
                      setStatusDropdownOpen(false);
                      setVisibilityDropdownOpen(false);
                      setDateDropdownOpen(false);
                      setCategoriesDropdownOpen(false);
                    }}
                    className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                  >
                    <span>{metadata.tags.length > 0 ? `${metadata.tags.length} selected` : 'Select'}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {tagsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3 mb-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Tags</span>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mb-3 relative">
                          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search tags..."
                            value={tagsSearchTerm}
                            onChange={(e) => setTagsSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
                          {filteredTags.length > 0 ? (
                            filteredTags.map(tag => (
                              <label key={tag.value} className="flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
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
                                  className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-900 dark:text-gray-100">{tag.text}</span>
                                {metadata.tags.includes(tag.value) && (
                                  <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No tags found matching "{tagsSearchTerm}"
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Select multiple tags for better searchability.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTagsDropdownOpen(false);
                            setTagsSearchTerm('');
                          }}
                          className="w-full bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
              Publish
            </Button>
          </div>
        </div>
        
        <div className="h-[calc(100vh-64px)] flex">


          {/* Center Canvas - Visual Layout Builder */}
          <div className="flex-1 relative h-full bg-gray-100 dark:bg-gray-900">
            <VisualLayoutBuilder
              initialLayout={currentLayout.blocks}
              onLayoutChange={updateLayout}
              onSave={saveBlog}
              blogData={metadata}
            />
            
            {/* Floating Elements Panel */}
            <FloatingElementsPanel
              onAddBlock={addElement}
              isVisible={isElementsPanelVisible}
              onToggle={() => setIsElementsPanelVisible(!isElementsPanelVisible)}
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
