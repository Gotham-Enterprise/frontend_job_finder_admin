"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";
import BlogDropdown from "./BlogDropdown";

import { 
  transformBlogDataForAPI, 
  validateBlogData, 
  type BlogMetadata
} from "@/services/utils/blogPayloadUtils";

import { blogApi } from "@/services/api/blog";
import { tagApi } from '@/services/api/tag';
import { 
  LayoutBlock, 
  BlockType, 
  BLOCK_TEMPLATES,
  BlogLayout 
} from "@/services/types/visualLayoutTypes";

interface EditBlogWithLayoutBuilderProps {
  blogId: string;
}

interface CategoryOption {
  value: string;
  text: string;
}

interface TagOption {
  value: string;
  text: string;
}

type ViewMode = 'builder' | 'classic' | 'preview';

const statusOptions = [
  { value: 'draft', label: 'Draft', description: 'This blog post will not be publicly accessible.' },
  { value: 'published', label: 'Published', description: 'This blog post can be viewed by anyone who has the link.' },
];

const createEmptyBlogLayout = (): BlogLayout => ({
  id: `layout-${Date.now()}`,
  name: 'Edit Blog Layout',
  blocks: [],
  settings: {
    maxWidth: 1200,
    backgroundColor: '#ffffff',
    padding: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: '1.0.0'
  }
});

const EditBlogWithLayoutBuilder: React.FC<EditBlogWithLayoutBuilderProps> = ({ 
  blogId: id 
}) => {
  const router = useRouter();

  // Core state management
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blogData, setBlogData] = useState<any>(null);
  
  // Categories and Tags state
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  
  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  
  // Modal states
  const titleModal = useModal();
  const [tempTitle, setTempTitle] = useState('');
  const [tempSeoData, setTempSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });
  
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });
  const [metadata, setMetadata] = useState({
    title: '',
    slug: '',
    excerpt: '',
    status: 'draft',
    permalink: '',
    visibility: 'public' as 'public' | 'private' | 'password',
    publishDate: new Date().toISOString(),
    categories: '',
    tags: [] as string[],
    seoTitle: '',
    seoDescription: '',
    allowComments: true,
    allowPings: true
  });
  const [currentLayout, setCurrentLayout] = useState<BlogLayout>(createEmptyBlogLayout());

  // State for managing floating elements panel
  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);
  const [childAddBlock, setChildAddBlock] = useState<((type: BlockType) => void) | null>(null);

  // Data fetching
  const fetchBlogData = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const response = await blogApi.getBlogPostById(id);
      
      if (response) {
        setBlogData(response);
        setMetadata({
          title: response.title || '',
          slug: response.slug || '',
          excerpt: response.excerpt || '',
          status: response.status || 'draft',
          permalink: response.slug || '',
          visibility: response.visibility || 'public',
          publishDate: response.publishedDate || new Date().toISOString(),
          categories: response.category?.name || '',
          tags: response.tags?.map(tag => tag.name) || [],
          seoTitle: response.seo?.title || response.title || '',
          seoDescription: response.seo?.description || response.excerpt || '',
          allowComments: true,
          allowPings: true
        });
        
        // Set layout from content
        if (response.content) {
          try {
            // Try to parse the content as JSON first (if it's a layout structure)
            let parsedContent;
            if (typeof response.content === 'string') {
              try {
                parsedContent = JSON.parse(response.content);
              } catch {
                // If parsing fails, treat as plain text
                parsedContent = response.content;
              }
            } else {
              parsedContent = response.content;
            }

            // Check if the parsed content has a blocks structure (visual layout)
            if (parsedContent && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
              setCurrentLayout(prev => ({
                ...prev,
                blocks: parsedContent.blocks.map((block: any) => ({
                  ...block,
                  id: block.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  position: block.position || { x: 0, y: 0, width: 100, height: 100 }
                }))
              }));
            } else {
              // If it's plain text or HTML, create a text block
              const textContent = typeof parsedContent === 'string' ? parsedContent : JSON.stringify(parsedContent);
              setCurrentLayout(prev => ({
                ...prev,
                blocks: [{
                  id: `block-${Date.now()}`,
                  type: 'text' as BlockType,
                  content: { text: textContent },
                  styles: {},
                  position: { x: 0, y: 0, width: 100, height: 200 }
                }]
              }));
            }
          } catch (error) {
            console.error('Error parsing content:', error);
            // Fallback to empty layout
            setCurrentLayout(prev => ({
              ...prev,
              blocks: []
            }));
          }
        }
      } else {
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
      router.push('/admin/blog');
    } finally {
      setIsPageLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await blogApi.getCategoriesForDropdown();
        if (response.success && response.data) {
          const categoryOptions = response.data.map(category => ({
            value: category.id,
            text: category.name
          }));
          setCategoryOptions(categoryOptions);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const response = await tagApi.getTags();
        if (response.success && response.data) {
          const tagOptions = response.data.map(tag => ({
            value: tag.id,
            text: tag.name
          }));
          setTagOptions(tagOptions);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Handle clicks outside dropdowns to close them
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

  // Sync seoData with metadata changes
  useEffect(() => {
    setSeoData(prev => ({
      ...prev,
      title: metadata.seoTitle || '',
      description: metadata.seoDescription || ''
    }));
  }, [metadata.seoTitle, metadata.seoDescription]);

  // Filtered options
  const filteredCategories = useMemo(() => 
    categoryOptions.filter(category =>
      category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
    ), [categoryOptions, categoriesSearchTerm]
  );

  const filteredTags = useMemo(() => 
    tagOptions.filter(tag =>
      tag.text.toLowerCase().includes(tagsSearchTerm.toLowerCase())
    ), [tagOptions, tagsSearchTerm]
  );

  // Helper function to toggle sections
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Update handlers
  const updateMetadataField = useCallback((field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Title modal handlers
  const handleOpenTitleModal = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    titleModal.openModal();
  }, [metadata.title, seoData, titleModal]);

  const handleTitleSave = useCallback(() => {
    updateMetadataField('title', tempTitle);
    setSeoData(tempSeoData);
    updateMetadataField('seoTitle', tempSeoData.title);
    updateMetadataField('seoDescription', tempSeoData.description);
    titleModal.closeModal();
  }, [tempTitle, tempSeoData, updateMetadataField, titleModal]);

  const handleTitleCancel = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    titleModal.closeModal();
  }, [metadata.title, seoData, titleModal]);

  const layoutUpdate = useCallback((newLayout: LayoutBlock[]) => {
    setCurrentLayout(prev => ({
      ...prev,
      blocks: newLayout,
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      }
    }));
  }, []);

  const addNewBlock = useCallback((blockType: BlockType) => {
    // Use the child's addBlock function if available (from VisualLayoutBuilder)
    if (childAddBlock) {
      childAddBlock(blockType);
    } else {
      // Fallback: add block directly to the layout
      const newBlock: LayoutBlock = {
        id: `block-${Date.now()}`,
        type: blockType,
        content: BLOCK_TEMPLATES[blockType]?.content || {},
        styles: BLOCK_TEMPLATES[blockType]?.styles || {},
        position: { x: 50, y: 50, width: 100, height: 100 }
      };

      setCurrentLayout(prev => ({
        ...prev,
        blocks: [...prev.blocks, newBlock]
      }));
    }
  }, [childAddBlock]);

  // Handle the addBlock reference from VisualLayoutBuilder
  const handleAddBlockRef = useCallback((addBlockFn: (type: BlockType) => void) => {
    setChildAddBlock(() => addBlockFn);
  }, []);

  // Publishing functionality
  const publishBlog = useCallback(async () => {
    try {
      setIsSaving(true);
      
      const payload = transformBlogDataForAPI(
        { 
          ...metadata, 
          status: 'published'
        } as unknown as BlogMetadata,
        currentLayout.blocks,
        [],
        []
      );
      
      const validation = validateBlogData(payload);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return;
      }
      
      const response = await blogApi.updateBlogPost(id, payload);
      
      if (response.success) {
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
    } finally {
      setIsSaving(false);
    }
  }, [metadata, currentLayout, id, router]);

  const saveDraft = useCallback(async () => {
    try {
      setIsSaving(true);
      
      const payload = transformBlogDataForAPI(
        {
          ...metadata,
          status: 'draft'
        } as unknown as BlogMetadata,
        currentLayout.blocks,
        [],
        []
      );

      const response = await blogApi.updateBlogPost(id, payload);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [metadata, currentLayout, id]);

  // Loading state
  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Blog post not found</h2>
          <Button 
            onClick={() => router.push('/admin/blog')}
            className="mt-4"
            variant="outline"
          >
            Back to Blog List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen overlay that covers everything including the admin header */}
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900">
        
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin/blog')}
                variant="outline"
                size="sm"
              >
                ← Back
              </Button>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Blog Title:</span>
                  <button
                    onClick={handleOpenTitleModal}
                    className="text-sm text-gray-900 hover:text-brand-600 underline"
                  >
                    {metadata.title || 'Click to add blog title...'}
                  </button>
                </div>

                <BlogDropdown
                  label="Status"
                  value={statusOptions.find(opt => opt.value === metadata.status)?.label || 'Draft'}
                  isOpen={statusDropdownOpen}
                  onToggle={() => {
                    setStatusDropdownOpen(!statusDropdownOpen);
                    setDateDropdownOpen(false);
                    setCategoriesDropdownOpen(false);
                    setTagsDropdownOpen(false);
                  }}
                >
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateMetadataField('status', option.value);
                          setStatusDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-center gap-3">
                          {metadata.status === option.value && (
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </BlogDropdown>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Date Posted:</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setDateDropdownOpen(!dateDropdownOpen);
                        setStatusDropdownOpen(false);
                        setCategoriesDropdownOpen(false);
                        setTagsDropdownOpen(false);
                      }}
                      className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                    >
                      <span>{new Date(metadata.publishDate).toLocaleDateString()}</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {dateDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[250px] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-900">Select Publication Date</span>
                        </div>
                        <div>
                          <input
                            type="date"
                            value={metadata.publishDate.split('T')[0]}
                            onChange={(e) => {
                              const newDate = new Date(e.target.value + 'T00:00:00');
                              updateMetadataField('publishDate', newDate.toISOString());
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Choose when this blog post should be published.
                        </p>
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => setDateDropdownOpen(false)}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Categories:</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setCategoriesDropdownOpen(!categoriesDropdownOpen);
                        setStatusDropdownOpen(false);
                        setDateDropdownOpen(false);
                        setTagsDropdownOpen(false);
                      }}
                      className="flex items-center justify-between bg-primary text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px]"
                    >
                      <span>{metadata.categories || 'Select'}</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {categoriesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[300px]">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="font-medium text-gray-900">Select Categories</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categoriesSearchTerm}
                            onChange={(e) => setCategoriesSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="p-2">
                            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                checked={!metadata.categories}
                                onChange={() => {
                                  updateMetadataField('categories', '');
                                }}
                                className="text-green-500"
                              />
                              <span className="text-sm text-gray-700">None</span>
                              {!metadata.categories && (
                                <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                            {filteredCategories.map((category) => (
                              <label key={category.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="radio"
                                  name="category"
                                  checked={metadata.categories === category.text}
                                  onChange={() => {
                                    updateMetadataField('categories', category.text);
                                  }}
                                  className="text-green-500"
                                />
                                <span className="text-sm text-gray-700">{category.text}</span>
                                {metadata.categories === category.text && (
                                  <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
                          Select one category for your blog post.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="relative dropdown-container">
                    <button
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
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[300px]">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v1M9 21h1c1.1 0 2-.9 2-2V7.5M3 18V7a2 2 0 012-2h.01" />
                            </svg>
                            <span className="font-medium text-gray-900">Select Tags</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Search tags..."
                            value={tagsSearchTerm}
                            onChange={(e) => setTagsSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="p-2">
                            {filteredTags.map((tag) => (
                              <label key={tag.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={metadata.tags.includes(tag.text)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    const currentTags = [...metadata.tags];
                                    
                                    if (isChecked && !currentTags.includes(tag.text)) {
                                      currentTags.push(tag.text);
                                    } else if (!isChecked) {
                                      const index = currentTags.indexOf(tag.text);
                                      if (index > -1) {
                                        currentTags.splice(index, 1);
                                      }
                                    }
                                    
                                    updateMetadataField('tags', currentTags);
                                  }}
                                  className="text-green-500 rounded"
                                />
                                <span className="text-sm text-gray-700">{tag.text}</span>
                                {metadata.tags.includes(tag.text) && (
                                  <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
                          Select multiple tags for better searchability.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={saveDraft}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={publishBlog}
                disabled={isSaving}
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                {isSaving ? 'Publishing...' : 'Update & Publish'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-80px)] flex">
          {/* Full Width - Visual Layout Builder */}
          <div className="flex-1 bg-white">
            <div className="h-full">
              <div className="h-full relative">
                <div className="h-full relative bg-gray-100">
                  <VisualLayoutBuilder
                    initialLayout={currentLayout.blocks}
                    onLayoutChange={layoutUpdate}
                    blogData={metadata}
                    onAddBlockRef={handleAddBlockRef}
                  />
                </div>

                <FloatingElementsPanel
                  onAddBlock={addNewBlock}
                  isVisible={isElementsPanelVisible}
                  onToggle={() => setIsElementsPanelVisible(!isElementsPanelVisible)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Modal */}
      <Modal
        isOpen={titleModal.isOpen}
        onClose={handleTitleCancel}
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold">Edit Blog Title & SEO Settings</h2>
          </div>
          <div>
            <Label htmlFor="blog-title">Blog Title</Label>
            <Input
              id="blog-title"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter your blog title..."
              className="mt-1"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium">SEO Settings</h3>
            </div>
            <p className="text-sm text-gray-600">
              Optimize your content for search engines by adding meta information
            </p>

            <div>
              <Label htmlFor="meta-title">Meta title (0/60 characters)</Label>
              <Input
                id="meta-title"
                value={tempSeoData.title}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter Meta title (recommended: 50-60 characters)"
                className="mt-1"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                This title will appear in search engine results and browser tabs
              </p>
            </div>

            <div>
              <Label htmlFor="meta-description">Meta Description (0/160 characters)</Label>
              <textarea
                id="meta-description"
                value={tempSeoData.description}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter Meta description (recommended: 150-160 characters)"
                rows={3}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                This description will appear in search engine results under your title
              </p>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={tempSeoData.keywords}
                onChange={(e) => setTempSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="Enter keywords separated by commas (e.g., react, javascript, web development)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add relevant keywords to help search engines understand your content
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">SEO Best Practices</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Keep titles under 60 characters for optimal display</li>
                    <li>• Write descriptions between 150-160 characters</li>
                    <li>• Use descriptive, relevant keywords naturally</li>
                    <li>• Make titles and descriptions compelling for users</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleTitleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTitleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditBlogWithLayoutBuilder;
