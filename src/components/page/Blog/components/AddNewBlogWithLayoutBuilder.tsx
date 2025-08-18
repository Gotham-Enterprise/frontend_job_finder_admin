"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import CustomDatePicker from "@/components/form/CustomDatePicker";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";
import ImageGalleryModal from "./VisualLayoutBuilder/components/ImageGalleryModal";
import BlogExitConfirmationModal from "@/components/ui/BlogExitConfirmationModal";

import { authUtils } from '@/services/utils/authUtils';
import { blogApi } from '@/services/api/blog';
import { tagApi } from '@/services/api/tag';
import { useCreateBlogPost } from '@/services/hooks/useBlog';
import { 
  transformBlogDataForAPI, 
  validateBlogData, 
  BlogCreatePayload,
  BlogMetadata as BlogMetadataType 
} from '@/services/utils/blogPayloadUtils';


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

interface BlogMetadata {
  title: string;
  permalink: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string;
  subCategories: string[];
  tags: string[];
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  allowPings: boolean;
  author: string;
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


const statusOptions = [
  { value: 'draft', label: 'Draft', description: 'This job posting will no longer be publicly accessible.' },
  { value: 'published', label: 'Published', description: 'This job posting can be viewed by anyone who has the link.' },
];

export default function AddNewBlogWithLayoutBuilder() {
  const router = useRouter();
  const titleModal = useModal();
  const { mutate: createBlogPost, isPending: isCreating } = useCreateBlogPost();
  
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [fullCategoriesData, setFullCategoriesData] = useState<CategoryWithSubCategories[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const [subCategoryOptions, setSubCategoryOptions] = useState<{ id: string; name: string }[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const [currentLayout, setCurrentLayout] = useState<LayoutType>(() => createInitialLayout());
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [subCategoriesDropdownOpen, setSubCategoriesDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [subCategoriesSearchTerm, setSubCategoriesSearchTerm] = useState('');
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  
  // Refs for click outside handling
  const subCategoriesDropdownRef = useRef<HTMLDivElement>(null);
  

  const { 
    isOpen: isTitleModalOpen, 
    openModal: openTitleModalHandler, 
    closeModal: closeTitleModal 
  } = useModal();

  const [metadata, setMetadata] = useState<BlogMetadata>({
    title: '',
    permalink: '',
    excerpt: '',
    status: 'draft',
    visibility: 'public',
    password: '',
    publishDate: new Date().toISOString(),
    categories: '',
    subCategories: [],
    tags: [],
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    allowComments: true,
    allowPings: true,
    author: '',
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
  const [tempMetadata, setTempMetadata] = useState({
    author: '',
    status: 'draft' as 'draft' | 'published' | 'pending' | 'private',
    publishDate: '',
    categories: '',
    subCategories: [] as string[],
    tags: [] as string[],
    featuredImage: ''
  });
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');

  useEffect(() => {
    setSeoData(prev => ({
      ...prev,
      title: metadata.seoTitle || '',
      description: metadata.seoDescription || ''
    }));
  }, [metadata.seoTitle, metadata.seoDescription]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await blogApi.getCategoriesForDropdown();
        
        if (response.success && response.data) {
          // Store the full categories data with subcategories
          setFullCategoriesData(response.data);
          
          const transformedCategories: CategoryOption[] = response.data
            .map((category: CategoryWithSubCategories) => ({
              value: category.id,
              text: category.name,
              selected: false
            }))
            .sort((a, b) => a.text.localeCompare(b.text)); // Sort alphabetically
          
          setCategoryOptions(transformedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryOptions([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const response = await tagApi.getTagsForDropdown();
        
        if (response.success && response.data) {
   
          const transformedTags: TagOption[] = response.data
            .map((tag) => ({
              value: tag.id,
              text: tag.name,
              selected: false
            }))
            .sort((a, b) => a.text.localeCompare(b.text)); // Sort alphabetically
          
          setTagOptions(transformedTags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
     
        setTagOptions([]);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!metadata.categories) {
        setSubCategoryOptions([]);
        return;
      }

      setSubCategoriesLoading(true);
      try {
        // Find the category name from categoryOptions
        const selectedCategory = categoryOptions.find(cat => cat.value === metadata.categories);
        if (!selectedCategory) {
          setSubCategoryOptions([]);
          return;
        }

        const response = await blogApi.getSubCategories(selectedCategory.text);
        
        if (response.success && response.data) {
          const sortedSubCategories = response.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setSubCategoryOptions(sortedSubCategories);
        } else {
          setSubCategoryOptions([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubCategoryOptions([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    };

    fetchSubCategories();
  }, [metadata.categories, categoryOptions]);

  // Fetch subcategories when tempMetadata category changes (for modal)
  useEffect(() => {
    const fetchSubCategoriesForModal = async () => {
      if (!tempMetadata.categories) {
        console.log('No category selected, clearing subcategories');
        setSubCategoryOptions([]);
        return;
      }

      console.log('tempMetadata.categories:', tempMetadata.categories);
      console.log('categoryOptions:', categoryOptions);

      setSubCategoriesLoading(true);
      try {
        // Find the category name from categoryOptions
        const selectedCategory = categoryOptions.find(cat => cat.value === tempMetadata.categories);
        console.log('selectedCategory:', selectedCategory);
        
        if (!selectedCategory) {
          console.log('Selected category not found in categoryOptions');
          setSubCategoryOptions([]);
          return;
        }

        console.log('Fetching subcategories for category:', selectedCategory.text);
        const response = await blogApi.getSubCategories(selectedCategory.text);
        console.log('Subcategories API response:', response);
        
        if (response.success && response.data) {
          console.log('Setting subcategory options:', response.data);
          const sortedSubCategories = response.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setSubCategoryOptions(sortedSubCategories);
        } else {
          console.log('No subcategories found or API error');
          setSubCategoryOptions([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories for modal:', error);
        setSubCategoryOptions([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    };

    fetchSubCategoriesForModal();
  }, [tempMetadata.categories, categoryOptions]);

  // Handle click outside subcategory dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subCategoriesDropdownRef.current && !subCategoriesDropdownRef.current.contains(event.target as Node)) {
        setSubCategoriesDropdownOpen(false);
      }
    };

    if (subCategoriesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [subCategoriesDropdownOpen]);

  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });

  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);
  const [childAddBlock, setChildAddBlock] = useState<((type: BlockType) => void) | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const previewModal = useModal();
  const imageGalleryModal = useModal();
  const exitConfirmationModal = useModal();

  const filteredCategories = useMemo(() => 
    categoryOptions
      .filter(category =>
        category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
      )
      .sort((a, b) => a.text.localeCompare(b.text)), // Sort alphabetically
    [categoryOptions, categoriesSearchTerm]
  );

  const filteredSubCategories = useMemo(() => {
    if (!subCategoryOptions || subCategoryOptions.length === 0) return [];
    
    return subCategoryOptions
      .filter(subCat =>
        subCat.name.toLowerCase().includes(subCategoriesSearchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }, [subCategoryOptions, subCategoriesSearchTerm]);

  const filteredTags = useMemo(() => 
    tagOptions
      .filter(tag =>
        tag.text.toLowerCase().includes(tagsSearchTerm.toLowerCase())
      )
      .sort((a, b) => a.text.localeCompare(b.text)), // Sort alphabetically
    [tagOptions, tagsSearchTerm]
  );

  const transformedLayoutData = useMemo(() => {
    return { metadata, currentLayout };
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
      const { metadata: blogMetadata } = transformedLayoutData;

      console.log('=== DEBUG: Generating blog payload ===');
      console.log('Blog metadata:', blogMetadata);
      console.log('Blog metadata.subCategories:', blogMetadata.subCategories);
      console.log('Current layout blocks:', currentLayout.blocks);
      console.log('Category options:', categoryOptions);
      console.log('Tag options:', tagOptions);
      console.log('Full categories data:', fullCategoriesData);

      const payload = transformBlogDataForAPI(
        blogMetadata,
        currentLayout.blocks,
        categoryOptions,
        tagOptions,
        fullCategoriesData
      );

      console.log('=== DEBUG: Generated payload ===');
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const validation = validateBlogData(payload);
      console.log('=== DEBUG: Validation result ===');
      console.log('Validation:', validation);
      
      return {
        blogPayload: payload,
        validation
      };
    } catch (error) {
      console.error('Error generating blog payload:', error);
      return null;
    }
  }, [transformedLayoutData, currentLayout.blocks, categoryOptions, tagOptions, fullCategoriesData]);

  const publishBlog = useCallback(async () => {
    const payloadData = generateBlogPayloadData();
    
    if (!payloadData) {
      console.error('Failed to generate blog payload');
      return;
    }

    const { blogPayload, validation } = payloadData;

    if (!validation.isValid) {
      return;
    }

    try {
      const publishPayload = {
        ...blogPayload,
        metadata: {
          ...blogPayload.metadata,
          status: tempMetadata.status
        }
      };

      console.log('=== DEBUG: Final payload being sent to API ===');
      console.log('Publish payload:', JSON.stringify(publishPayload, null, 2));

      createBlogPost(publishPayload, {
        onSuccess: () => {
          console.log('=== DEBUG: Blog created successfully ===');
          router.push('/admin/blog');
        },
        onError: (error) => {
          console.error('=== DEBUG: Error creating blog ===');
          console.error('Error details:', error);
          console.error('Error response:', (error as any).response);
          console.error('Error data:', (error as any).response?.data);
        }
      });
    } catch (error) {
      console.error('Error preparing blog data:', error);
    }
  }, [generateBlogPayloadData, router, createBlogPost]);

  const updateMetadata = useCallback((field: keyof BlogMetadata, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value,
      // Clear subcategories when category changes
      ...(field === 'categories' ? { subCategories: [] } : {})
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

  const openTitleModal = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    setTempMetadata({
      author: metadata.author,
      status: metadata.status,
      publishDate: metadata.publishDate,
      categories: metadata.categories,
      subCategories: metadata.subCategories,
      tags: metadata.tags,
      featuredImage: metadata.featuredImage || ''
    });
    setActiveTab('general');
    openTitleModalHandler();
  }, [metadata.title, metadata.author, metadata.status, metadata.publishDate, metadata.categories, metadata.tags, metadata.featuredImage, seoData, openTitleModalHandler]);

  const saveTitleModal = useCallback(() => {
    console.log('=== DEBUG: Saving modal data ===');
    console.log('tempMetadata.subCategories:', tempMetadata.subCategories);
    
    updateTitle(tempTitle);
    setSeoData(tempSeoData);
    updateMetadata('seoTitle', tempSeoData.title);
    updateMetadata('seoDescription', tempSeoData.description);
    updateMetadata('author', tempMetadata.author);
    updateMetadata('status', tempMetadata.status);
    updateMetadata('publishDate', tempMetadata.publishDate);
    updateMetadata('categories', tempMetadata.categories);
    updateMetadata('subCategories', tempMetadata.subCategories);
    updateMetadata('tags', tempMetadata.tags);
    updateMetadata('featuredImage', tempMetadata.featuredImage);
    closeTitleModal();
  }, [tempTitle, tempSeoData, tempMetadata, updateTitle, updateMetadata, closeTitleModal]);

  const cancelTitleModal = useCallback(() => {
    setTempTitle(metadata.title);
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    setTempMetadata({
      author: metadata.author,
      status: metadata.status,
      publishDate: metadata.publishDate,
      categories: metadata.categories,
      subCategories: metadata.subCategories,
      tags: metadata.tags,
      featuredImage: metadata.featuredImage || ''
    });
    closeTitleModal();
  }, [metadata.title, metadata.author, metadata.status, metadata.publishDate, metadata.categories, metadata.subCategories, metadata.tags, metadata.featuredImage, seoData, closeTitleModal]);

  const saveBlog = useCallback(async () => {
    await publishBlog();
  }, [publishBlog]);

  const previewBlog = useCallback(() => {
   
    console.log('Preview blog functionality');
  }, []);

  const setFeaturedImageInModal = useCallback((imageUrl: string) => {
    setTempMetadata(prev => ({ ...prev, featuredImage: imageUrl }));
    imageGalleryModal.closeModal();
  }, [imageGalleryModal]);

  const handleSetFeaturedImage = useCallback((imageUrl: string) => {
    updateMetadata('featuredImage', imageUrl);
  }, [updateMetadata]);

  const handleRemoveFeaturedImage = useCallback(() => {
    updateMetadata('featuredImage', '');
  }, [updateMetadata]);

  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      exitConfirmationModal.openModal();
    } else {
      router.push('/admin/blog');
    }
  }, [hasUnsavedChanges, exitConfirmationModal, router]);

  const handleSaveAsDraft = useCallback(async () => {
    const updatedMetadata = { ...metadata, status: 'draft' as const };
    setMetadata(updatedMetadata);
    
    const payloadData = generateBlogPayloadData();
    if (!payloadData) {
      console.error('Failed to generate blog payload');
      return;
    }

    const { blogPayload, validation } = payloadData;
    if (!validation.isValid) {
      return;
    }

    const draftPayload = {
      ...blogPayload,
      metadata: {
        ...blogPayload.metadata,
        status: 'draft'
      }
    };

    createBlogPost(draftPayload, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        exitConfirmationModal.closeModal();
        router.push('/admin/blog');
      },
      onError: (error) => {
        console.error('Error saving draft:', error);
      }
    });
  }, [metadata, generateBlogPayloadData, createBlogPost, exitConfirmationModal, router]);

  const handleExitWithoutSaving = useCallback(() => {
    setHasUnsavedChanges(false);
    exitConfirmationModal.closeModal();
    router.push('/admin/blog');
  }, [exitConfirmationModal, router]);

  const canSave = metadata.title.trim().length > 0;

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

  // Track changes to mark blog as having unsaved changes
  useEffect(() => {
    const hasContentChanges = metadata.title.trim().length > 0 || 
                             currentLayout.blocks.length > 0 ||
                             metadata.excerpt.trim().length > 0 ||
                             metadata.categories.length > 0 ||
                             metadata.tags.length > 0;
    
    setHasUnsavedChanges(hasContentChanges);
  }, [metadata.title, metadata.excerpt, metadata.categories, metadata.tags, currentLayout.blocks]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900">
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              size="sm"
              className='text-brand-400'
            >
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div className="flex items-center space-x-6">
              <div className="ml-4 flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Blog Title:
                </label>
                <button
                  type="button"
                  onClick={openTitleModal}
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
              
             
        

             
          </div>
        </div>
         <div className="flex items-center space-x-3">
            <Button
              onClick={() => saveBlog()}
              disabled={!canSave}
              className="px-4 py-2"
            >
              {tempMetadata.status === 'draft' ? 'Save as Draft' : 'Publish'}
            </Button>
          </div>
        </div>
        
        <div className="h-[calc(100vh-64px)] flex">


          <div className="flex-1 relative h-full bg-gray-100 dark:bg-gray-900">
            <VisualLayoutBuilder
              initialLayout={currentLayout.blocks}
              onLayoutChange={updateLayout}
              onSave={saveBlog}
              blogData={metadata}
              onAddBlockRef={handleAddBlockRef}
              onSetFeaturedImage={handleSetFeaturedImage}
              currentFeaturedImage={metadata.featuredImage}
            />
            

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

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryModal.isOpen}
        onClose={imageGalleryModal.closeModal}
        onImageSelect={setFeaturedImageInModal}
        onSetFeaturedImage={setFeaturedImageInModal}
        currentFeaturedImage={tempMetadata.featuredImage}
      />

      {/* Exit Confirmation Modal */}
      <BlogExitConfirmationModal
        isOpen={exitConfirmationModal.isOpen}
        onClose={exitConfirmationModal.closeModal}
        onSaveAsDraft={handleSaveAsDraft}
        onExitWithoutSaving={handleExitWithoutSaving}
        blogTitle={metadata.title || "Untitled Blog"}
        isLoading={isCreating}
      />

      {/* Title & SEO Modal */}
      <Modal
        isOpen={isTitleModalOpen}
        onClose={cancelTitleModal}
        showCloseButton={false}
        isFullscreen={false}
        className="max-w-3xl w-full mx-auto my-8 rounded-lg shadow-xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Add Blog Title & SEO Settings</h2>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'seo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                SEO Settings
              </button>
            </nav>
          </div>

          {/* General Tab Content */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Blog Title */}
              <div>
                <label htmlFor="modal-blog-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blog Title <span className="text-red-500">*</span>
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

              {/* Author */}
              <div>
                <label htmlFor="modal-author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-author"
                  type="text"
                  value={tempMetadata.author}
                  onChange={(e) => setTempMetadata(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                />
              </div>

              {/* Status */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <span>{statusOptions.find(option => option.value === tempMetadata.status)?.label || 'Select Status'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTempMetadata(prev => ({ ...prev, status: option.value as any }));
                            setStatusDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <label htmlFor="modal-publish-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Posted <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-publish-date"
                  type="datetime-local"
                  value={tempMetadata.publishDate ? new Date(tempMetadata.publishDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setTempMetadata(prev => ({ ...prev, publishDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <span>
                      {tempMetadata.categories ? 
                        categoryOptions.find(cat => cat.value === tempMetadata.categories)?.text || 'Select Category' 
                        : 'Select Category'
                      }
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {categoriesDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categoriesSearchTerm}
                          onChange={(e) => setCategoriesSearchTerm(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {filteredCategories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => {
                            setTempMetadata(prev => ({ 
                              ...prev, 
                              categories: category.value,
                              subCategories: [] // Clear subcategories when category changes
                            }));
                            setCategoriesDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {category.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SubCategories */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SubCategories
                </label>
                <div className="relative" ref={subCategoriesDropdownRef}>
                  <button
                    onClick={() => setSubCategoriesDropdownOpen(!subCategoriesDropdownOpen)}
                    disabled={!tempMetadata.categories}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-left flex items-center justify-between ${
                      !tempMetadata.categories 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    <span>
                      {!tempMetadata.categories ? 
                        'Select a category first' : 
                        tempMetadata.subCategories.length > 0 ? 
                          `${tempMetadata.subCategories.length} subcategory(ies) selected` : 
                          'Select subcategories'
                      }
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {subCategoriesDropdownOpen && tempMetadata.categories && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search subcategories..."
                          value={subCategoriesSearchTerm}
                          onChange={(e) => setSubCategoriesSearchTerm(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto">
                        {subCategoriesLoading ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading subcategories...</span>
                            </div>
                          </div>
                        ) : filteredSubCategories.length > 0 ? (
                          <>
                            {filteredSubCategories.map(subCategory => (
                              <label key={subCategory.id} className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                <input
                                  type="checkbox"
                                  checked={tempMetadata.subCategories.includes(subCategory.id)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    const currentSubCategories = [...tempMetadata.subCategories];
                                    
                                    if (isChecked && !currentSubCategories.includes(subCategory.id)) {
                                      currentSubCategories.push(subCategory.id);
                                    } else if (!isChecked) {
                                      const index = currentSubCategories.indexOf(subCategory.id);
                                      if (index > -1) {
                                        currentSubCategories.splice(index, 1);
                                      }
                                    }
                                    
                                    setTempMetadata(prev => ({ ...prev, subCategories: currentSubCategories }));
                                  }}
                                  className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 rounded"
                                />
                                <span className="text-gray-900 dark:text-gray-100">{subCategory.name}</span>
                                {tempMetadata.subCategories.includes(subCategory.id) && (
                                  <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))}
                          </>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            {subCategoriesSearchTerm ? 
                              `No subcategories found matching "${subCategoriesSearchTerm}"` : 
                              'No subcategories available for this category'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select subcategories for more specific categorization. {!tempMetadata.categories && 'Please select a category first.'}
                </p>
              </div>

              {/* Tags */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <span>
                      {tempMetadata.tags.length > 0 
                        ? `${tempMetadata.tags.length} tag(s) selected`
                        : 'Select Tags'
                      }
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {tagsDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search tags..."
                          value={tagsSearchTerm}
                          onChange={(e) => setTagsSearchTerm(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {filteredTags.map((tag) => (
                        <label
                          key={tag.value}
                          className="flex items-center px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={tempMetadata.tags.includes(tag.value)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setTempMetadata(prev => ({
                                ...prev,
                                tags: isChecked
                                  ? [...prev.tags, tag.value]
                                  : prev.tags.filter(t => t !== tag.value)
                              }));
                            }}
                            className="mr-2"
                          />
                          {tag.text}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {tempMetadata.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tempMetadata.tags.map((tagId) => {
                      const tag = tagOptions.find(t => t.value === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag.text}
                          <button
                            onClick={() => setTempMetadata(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tagId)
                            }))}
                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => imageGalleryModal.openModal()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Choose Image
                  </button>
                  {tempMetadata.featuredImage && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={tempMetadata.featuredImage}
                        alt="Featured"
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        onClick={() => setTempMetadata(prev => ({ ...prev, featuredImage: '' }))}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings Tab Content */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold">SEO Settings</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimize your content for search engines by adding meta information
                </p>
              </div>

              {/* SEO Title */}
              <div>
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
              <div>
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
              <div>
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
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={cancelTitleModal}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={saveTitleModal}
              disabled={!tempTitle.trim() || !tempMetadata.author.trim() || !tempMetadata.categories || tempMetadata.tags.length === 0 || !tempMetadata.featuredImage}
              className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <FullScreenSpinner 
        isVisible={isCreating} 
        message="Publishing blog post..." 
      />
    </>
  );
}
