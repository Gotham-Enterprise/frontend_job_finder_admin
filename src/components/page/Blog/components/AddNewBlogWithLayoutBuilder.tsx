"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useProgressLoader } from "@/hooks/useProgressLoader";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";
import ProgressLoader from "@/components/ui/ProgressLoader";

import { BlogMetadata as OriginalBlogMetadata, BlogLayout, BlogPayload } from '@/types/blog';
import { 
  generateBlogPayload, 
  validateBlogPayload, 
  formatPayloadForApi,
  createBlogAnalytics 
} from '@/lib/blogPayloadUtils';
import { logPayloadFormatted, generatePayloadPreview } from '@/lib/blogPayloadLogger';
import { createBlogApiService } from '@/services/blogApiService';
import { authUtils } from '@/services/utils/authUtils';
import { blogApi } from '@/services/api/blog';


import { 
  BlogLayout as LayoutType, 
  LayoutBlock,
  convertLayoutToBlogPayload,
  BlockType,
  BLOCK_TEMPLATES
} from "@/services/types/visualLayoutTypes";

import { 
  CategoryOption, 
  TagOption 
} from "@/services/types/blogPostType";

import { CategoryWithSubCategories } from '@/services/types/subCategoryTypes';
import { openBlogPreview } from "@/services/blogPreviewService";

interface BlogMetadata {
  title: string;
  permalink: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  allowPings: boolean;
}

type ViewMode = 'builder' | 'classic' | 'preview';

const createInitialLayout = (): LayoutType => {
  return {
    id: `layout-${Date.now()}`,
    name: 'New Blog Post',
    blocks: [],
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

const blogApiService = createBlogApiService({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  apiKey: process.env.NEXT_PUBLIC_API_KEY
});

// Move static data outside component to prevent recreation on every render
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
];

export default function AddNewBlogWithLayoutBuilder() {
  // Dynamic categories state
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [currentLayout, setCurrentLayout] = useState<LayoutType>(() => createInitialLayout());
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  

  const { 
    isOpen: isTitleModalOpen, 
    openModal: openTitleModal, 
    closeModal: closeTitleModal 
  } = useModal();
  

  const {
    isVisible: isProgressVisible,
    showLoader,
    hideLoader
  } = useProgressLoader({
    onComplete: useCallback(() => {
      // onComplete will be handled by the progress loader itself
    }, [])
  });
  

  const [metadata, setMetadata] = useState<BlogMetadata>({
    title: '',
    permalink: '',
    excerpt: '',
    status: 'draft',
    visibility: 'public',
    password: '',
    publishDate: new Date().toISOString().split('T')[0],
    categories: '',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    allowComments: true,
    allowPings: true,
  });

  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });

  const [tempTitle, setTempTitle] = useState('');
  const [tempSeoData, setTempSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });

  // Sync seoData with metadata changes
  useEffect(() => {
    setSeoData(prev => ({
      ...prev,
      title: metadata.seoTitle || '',
      description: metadata.seoDescription || ''
    }));
  }, [metadata.seoTitle, metadata.seoDescription]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await blogApi.getCategoriesForDropdown();
        
        if (response.success && response.data) {
          // Transform API categories to CategoryOption format
          const transformedCategories: CategoryOption[] = response.data.map((category: CategoryWithSubCategories) => ({
            value: category.id,
            text: category.name,
            selected: false
          }));
          
          setCategoryOptions(transformedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array if fetch fails
        setCategoryOptions([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });

  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);
  const [childAddBlock, setChildAddBlock] = useState<((type: BlockType) => void) | null>(null);

  const previewModal = useModal();

  const filteredCategories = useMemo(() => 
    categoryOptions.filter(category =>
      category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
    ), [categoryOptions, categoriesSearchTerm]
  );

  const filteredTags = useMemo(() => 
    tagOptions.filter(tag =>
      tag.text.toLowerCase().includes(tagsSearchTerm.toLowerCase())
    ), [tagsSearchTerm]
  );

  const transformedLayoutData = useMemo(() => {
    const transformedLayout: BlogLayout = {
      id: currentLayout.id,
      name: currentLayout.name,
      blocks: currentLayout.blocks.map(block => ({
        id: block.id,
        type: block.type === 'paragraph' ? 'text' : block.type as any,
        content: block.content,
        styles: block.styles,
        position: block.position,
        metadata: block.metadata
      })),
      settings: currentLayout.settings,
      metadata: currentLayout.metadata
    };

    const transformedMetadata: OriginalBlogMetadata = {
      title: metadata.title,
      permalink: metadata.permalink,
      excerpt: metadata.excerpt,
      status: metadata.status,
      visibility: metadata.visibility,
      password: metadata.password,
      publishDate: metadata.publishDate,
      categories: metadata.categories,
      tags: metadata.tags,
      seoTitle: metadata.seoTitle,
      seoDescription: metadata.seoDescription,
      allowComments: metadata.allowComments,
      allowPings: metadata.allowPings
    };

    return { transformedLayout, transformedMetadata };
  }, [currentLayout, metadata]);


  const authorInfo = useMemo(() => {
    const currentUser = authUtils.getUser();
    return currentUser ? {
      id: currentUser.id,
      name: authUtils.getUserDisplayName(),
      email: currentUser.email
    } : {
      id: 'guest-user',
      name: 'Guest User',
      email: 'guest@example.com'
    };
  }, []);

  const generateBlogPayloadData = useCallback(() => {
    try {
      const { transformedLayout, transformedMetadata } = transformedLayoutData;

      const payload = generateBlogPayload(
        transformedLayout,
        transformedMetadata,
        categoryOptions,
        tagOptions,
        authorInfo
      );

      const validation = validateBlogPayload(payload);
      const apiPayload = formatPayloadForApi(payload);
      
      return {
        blogPayload: payload,
        apiPayload,
        validation
      };
    } catch (error) {
      console.error('Error generating blog payload:', error);
      return null;
    }
  }, [transformedLayoutData, authorInfo]);

  const publishBlog = useCallback(async () => {
    const payloadData = generateBlogPayloadData();
    
    if (!payloadData) {
      console.error('Failed to generate blog payload');
      return;
    }

    const { blogPayload, apiPayload, validation } = payloadData;

    const logResult = logPayloadFormatted(blogPayload, apiPayload, validation, 'publish');
    

    console.log(generatePayloadPreview(blogPayload));

    if (!validation.isValid) {
      console.warn('⚠️ Validation failed - blog contains errors that should be fixed before publishing');
      return;
    }

    try {
      showLoader({
        title: 'Publishing Blog...',
        subtitle: 'Preparing your content for publication',
        duration: 3000
      });

      const response = await blogApiService.publishBlog(blogPayload);
      
      if (response.success) {
        console.log('✅ Blog published successfully:', response.data);
        // Let the progress loader complete naturally before hiding
      } else {
        console.error('❌ Failed to publish blog:', response.message, response.errors);
        hideLoader();
      }
    } catch (error) {
      console.error('💥 Error publishing blog:', error);
      hideLoader();
    }
  }, [generateBlogPayloadData, showLoader, hideLoader]);

  const saveDraft = useCallback(async () => {
    const payloadData = generateBlogPayloadData();
    
    if (!payloadData) {
      console.error('Failed to generate blog payload');
      return;
    }

    const { blogPayload, apiPayload, validation } = payloadData;

    const logResult = logPayloadFormatted(blogPayload, apiPayload, validation, 'draft');
    

    console.log(generatePayloadPreview(blogPayload));

    try {
      showLoader({
        title: 'Saving Draft...',
        subtitle: 'Preserving your content as draft',
        duration: 2000
      });

      const response = await blogApiService.draftBlog(blogPayload);
      
      if (response.success) {
        console.log('✅ Blog draft saved successfully:', response.data);
      } else {
        hideLoader();
      }
    } catch (error) {
      console.error('💥 Error saving blog draft:', error);
      hideLoader();
    }
  }, [generateBlogPayloadData, showLoader, hideLoader]);


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

  const handleOpenTitleModal = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    openTitleModal();
  }, [metadata.title, seoData, openTitleModal]);

  const handleTitleSave = useCallback(() => {
    updateTitle(tempTitle);
    setSeoData(tempSeoData);
    updateMetadata('seoTitle', tempSeoData.title);
    updateMetadata('seoDescription', tempSeoData.description);
    closeTitleModal();
  }, [tempTitle, tempSeoData, updateTitle, updateMetadata, closeTitleModal]);

  const handleTitleCancel = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    closeTitleModal();
  }, [metadata.title, seoData, closeTitleModal]);

  const saveBlog = useCallback(async () => {
    await publishBlog();
  }, [publishBlog]);

  const previewBlog = useCallback(() => {
    openBlogPreview(metadata, currentLayout.blocks, categoryOptions, tagOptions);
  }, [metadata, currentLayout.blocks, categoryOptions, tagOptions]);

  const handleAddBlockRef = useCallback((addBlockFn: (type: BlockType) => void) => {
    setChildAddBlock(() => addBlockFn);
  }, []);

  const addElement = useCallback((type: BlockType) => {
   
    if (childAddBlock) {
      childAddBlock(type);
    } else {
   
      const template = BLOCK_TEMPLATES[type];
      const newBlock: LayoutBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...template,
        styles: template.styles || {},
        content: template.content || {},
        position: template.position || { x: 0, y: 0, width: 100, height: 100 },
      } as LayoutBlock;

      setCurrentLayout(prev => {
        const currentBlocks = Array.isArray(prev.blocks) ? prev.blocks : [];
        return {
          ...prev,
          blocks: [...currentBlocks, newBlock],
          metadata: {
            ...prev.metadata,
            updated: new Date().toISOString(),
          },
        };
      });
    }
  }, [childAddBlock]);

  const canSave = metadata.title.trim().length > 0;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setStatusDropdownOpen(false);
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Blog Title:
                </label>
                <button
                  type="button"
                  onClick={handleOpenTitleModal}
                  className="w-60 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
                >
                  <span className="truncate flex-1 mr-2">
                    {metadata.title || (
                      <span className="text-gray-500 dark:text-gray-400">Click to add blog title...</span>
                    )}
                  </span>
                  {metadata.title && (
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
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
                    disabled={categoriesLoading}
                    onClick={() => {
                      if (!categoriesLoading) {
                        setCategoriesDropdownOpen(!categoriesDropdownOpen);
                        setStatusDropdownOpen(false);
                        setDateDropdownOpen(false);
                        setTagsDropdownOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px] ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>
                      {categoriesLoading ? (
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading...</span>
                        </div>
                      ) : metadata.categories 
                        ? categoryOptions.find(cat => cat.value === metadata.categories)?.text || metadata.categories
                        : 'Select'
                      }
                    </span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {categoriesDropdownOpen && !categoriesLoading && (
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
                          {categoriesLoading ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading categories...</span>
                              </div>
                            </div>
                          ) : filteredCategories.length > 0 ? (
                            <>
                              {/* None option */}
                              <label className="flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                                <input
                                  type="radio"
                                  name="category"
                                  checked={metadata.categories === ''}
                                  onChange={() => {
                                    updateMetadata('categories', '');
                                  }}
                                  className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-gray-500 dark:text-gray-400 italic">None</span>
                                {metadata.categories === '' && (
                                  <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                              
                              {filteredCategories.map(category => (
                                <label key={category.value} className="flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                                  <input
                                    type="radio"
                                    name="category"
                                    checked={metadata.categories === category.value}
                                    onChange={() => {
                                      updateMetadata('categories', category.value);
                                    }}
                                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-900 dark:text-gray-100">{category.text}</span>
                                  {metadata.categories === category.value && (
                                    <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </label>
                              ))}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              {categoriesSearchTerm ? 
                                `No categories found matching "${categoriesSearchTerm}"` : 
                                'No categories available'
                              }
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Select one category for your blog post.
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
                              No tags found matching &ldquo;{tagsSearchTerm}&rdquo;
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
            {/* <Button
              variant="secondary"
              onClick={previewBlog}
              disabled={!canSave}
              className="px-4 py-2 hidden"
            >
              Preview
            </Button> */}
            <Button
              onClick={() => saveBlog()}
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
              onAddBlockRef={handleAddBlockRef}
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

      {/* Title & SEO Modal */}
      <Modal
        isOpen={isTitleModalOpen}
        onClose={handleTitleCancel}
        showCloseButton={false}
        isFullscreen={false}
        className="max-w-3xl w-full mx-auto my-8 rounded-lg shadow-xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Edit Blog Title & SEO Settings</h2>
          
          {/* Blog Title Section */}
          <div className="mb-6">
            <label htmlFor="modal-blog-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Title
            </label>
            <input
              id="modal-blog-title"
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter your blog title..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              autoFocus
            />
          </div>

          {/* SEO Settings Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              SEO Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Optimize your content for search engines by adding meta information
            </p>

            {/* SEO Title */}
            <div className="mb-4">
              <label htmlFor="seo-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta title <span className="text-gray-500">({tempSeoData.title.length}/60 characters)</span>
              </label>
              <input
                id="seo-title"
                type="text"
                value={tempSeoData.title}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter Meta title (recommended: 50-60 characters)"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This title will appear in search engine results and browser tabs
              </p>
            </div>

            {/* SEO Description */}
            <div className="mb-4">
              <label htmlFor="seo-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description <span className="text-gray-500">({tempSeoData.description.length}/160 characters)</span>
              </label>
              <textarea
                id="seo-description"
                value={tempSeoData.description}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter Meta description (recommended: 150-160 characters)"
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This description will appear in search engine results under your title
              </p>
            </div>

            {/* Keywords */}
            <div className="mb-4">
              <label htmlFor="seo-keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords 
              </label>
              <input
                id="seo-keywords"
                type="text"
                value={tempSeoData.keywords}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="Enter keywords separated by commas (e.g., react, javascript, web development)"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add relevant keywords to help search engines understand your content
              </p>
            </div>

            {/* SEO Best Practices */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">SEO Best Practices</h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Keep titles under 60 characters for optimal display</li>
                    <li>• Write descriptions between 150-160 characters</li>
                    <li>• Use descriptive, relevant keywords naturally</li>
                    <li>• Make titles and descriptions compelling for users</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={handleTitleCancel}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTitleSave}
              className="px-4 py-2"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {isProgressVisible && (
        <ProgressLoader 
          isVisible={isProgressVisible}
          title="Publishing Blog..."
          subtitle="Preparing your content for publication"
        />
      )}
    </>
  );
}
