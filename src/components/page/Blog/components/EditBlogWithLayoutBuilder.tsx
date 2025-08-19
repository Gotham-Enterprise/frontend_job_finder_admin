"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import CustomDatePicker from "@/components/form/CustomDatePicker";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";
import ImageGalleryModal from "./VisualLayoutBuilder/components/ImageGalleryModal";
import BlogExitConfirmationModal from "@/components/ui/BlogExitConfirmationModal";
import BlogDropdown from "./BlogDropdown";
import { authUtils } from '@/services/utils/authUtils';
import { 
  transformBlogDataForAPI, 
  validateBlogData, 
  BlogCreatePayload,
  BlogMetadata 
} from '@/services/utils/blogPayloadUtils';
import { CategoryWithSubCategories } from '@/services/types/subCategoryTypes';
import { blogApi } from "@/services/api/blog";
import { tagApi } from '@/services/api/tag';
import { useUpdateBlogPost } from '@/services/hooks/useBlog';
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

const naturalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { 
    numeric: true, 
    sensitivity: 'base' 
  });
};

const EditBlogWithLayoutBuilder: React.FC<EditBlogWithLayoutBuilderProps> = ({ 
  blogId: id 
}) => {
  const router = useRouter();
  const { mutate: updateBlogPost, isPending: isUpdating } = useUpdateBlogPost();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [blogData, setBlogData] = useState<any>(null);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  
  const [fullCategoriesData, setFullCategoriesData] = useState<CategoryWithSubCategories[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<{ id: string; name: string }[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesDropdownOpen, setSubCategoriesDropdownOpen] = useState(false);
  const [subCategoriesSearchTerm, setSubCategoriesSearchTerm] = useState('');
  
  const subCategoriesDropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  

  const titleModal = useModal();
  const imageGalleryModal = useModal();
  const exitConfirmationModal = useModal();
  const [tempSeoData, setTempSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });
  
  const [tempMetadata, setTempMetadata] = useState<BlogMetadata>({
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
  
  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    categories: true,
    tags: true,
    seo: false,
    settings: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
  const [currentLayout, setCurrentLayout] = useState<BlogLayout>(createEmptyBlogLayout());


  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);
  const [childAddBlock, setChildAddBlock] = useState<((type: BlockType) => void) | null>(null);

  const fetchBlogData = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const response = await blogApi.getBlogPostById(id);
      
      if (response) {
        setBlogData(response);
        const blogResponse = response as any;
              
    
        setMetadata({
          title: blogResponse.title || '',
          excerpt: blogResponse.excerpt || '',
          status: blogResponse.metadata?.status || blogResponse.status || 'draft',
          permalink: blogResponse.slug || '',
          visibility: blogResponse.metadata?.visibility || blogResponse.visibility || 'public',
          publishDate: blogResponse.metadata?.publishDate || blogResponse.publishedDate || new Date().toISOString(),
          categories: blogResponse.metadata?.categories?.[0]?.id || blogResponse.category?.id || '',
          subCategories: blogResponse.metadata?.subCategories?.map((sub: any) => sub.id) || 
                        blogResponse.metadata?.categories?.[0]?.subCategory?.map((sub: any) => sub.id) || 
                        blogResponse.metadata?.categories?.[0]?.subCategories?.map((sub: any) => sub.id) || [],
          tags: blogResponse.metadata?.tags?.map((tag: any) => tag.id) || 
                blogResponse.tags?.map((tag: any) => tag.id) || [],
          seoTitle: blogResponse.metadata?.seo?.title || blogResponse.seo?.title || blogResponse.title || '',
          seoDescription: blogResponse.metadata?.seo?.description || blogResponse.seo?.description || blogResponse.excerpt || '',
          allowComments: true,
          allowPings: true,
          featuredImage: blogResponse.featuredImage || '',
          author: (() => {
            const metadataAuthor = blogResponse.metadata?.author;
            if (metadataAuthor) {
              return metadataAuthor.name || `${metadataAuthor.firstName || ''} ${metadataAuthor.lastName || ''}`.trim() || 'Unknown Author';
            }
            if (typeof blogResponse.author === 'string') {
              return blogResponse.author;
            } else if (blogResponse.author && typeof blogResponse.author === 'object') {
              return blogResponse.author.name || 'Unknown Author';
            }
            return 'No Author';
          })()
        });
        
 
        if (response.content) {
          try {
           
            let parsedContent;
            if (typeof response.content === 'string') {
              try {
                parsedContent = JSON.parse(response.content);
              } catch {
              
                parsedContent = response.content;
              }
            } else {
              parsedContent = response.content;
            }

           
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

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await blogApi.getCategoriesForDropdown();
        if (response.success && response.data) {
       
          setFullCategoriesData(response.data);
          
          const transformedCategories: CategoryOption[] = response.data
            .map((category: CategoryWithSubCategories) => ({
              value: category.id,
              text: category.name
            }))
            .sort((a, b) => naturalSort(a.text, b.text));
          setCategoryOptions(transformedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
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
        const response = await tagApi.getTags();
        if (response.success && response.data) {
          const tagOptions = response.data
            .map(tag => ({
              value: tag.id,
              text: tag.name
            }))
            .sort((a, b) => naturalSort(a.text, b.text)); 
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

  useEffect(() => {
    const fetchSubCategoriesForModal = async () => {
      if (!tempMetadata.categories) {
        setSubCategoryOptions([]);
        return;
      }

      setSubCategoriesLoading(true);
      try {

        const selectedCategory = categoryOptions.find(cat => cat.value === tempMetadata.categories);
        
        if (!selectedCategory) {
          setSubCategoryOptions([]);
          return;
        }

        const response = await blogApi.getSubCategories(selectedCategory.text);
        
        if (response.success && response.data) {
          const sortedSubCategories = response.data.sort((a: any, b: any) => naturalSort(a.name, b.name));
          setSubCategoryOptions(sortedSubCategories);
        } else {
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

  useEffect(() => {
    setSeoData(prev => ({
      ...prev,
      title: metadata.seoTitle || '',
      description: metadata.seoDescription || ''
    }));
  }, [metadata.seoTitle, metadata.seoDescription]);

  useEffect(() => {
    if (!blogData) return; 
    
    const hasContentChanges = JSON.stringify(metadata) !== JSON.stringify(blogData.metadata) ||
                             JSON.stringify(currentLayout.blocks) !== JSON.stringify(blogData.blocks);
    
    setHasUnsavedChanges(hasContentChanges);
  }, [metadata, currentLayout.blocks, blogData]);


  const filteredCategories = useMemo(() => 
    categoryOptions
      .filter(category =>
        category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
      )
      .sort((a, b) => naturalSort(a.text, b.text)), 
    [categoryOptions, categoriesSearchTerm]
  );

  const filteredSubCategories = useMemo(() => {
    if (!tempMetadata.categories) return [];
    
    const selectedCategory = fullCategoriesData.find(cat => cat.id === tempMetadata.categories);
    if (!selectedCategory?.subCategories) return [];
    
    return selectedCategory.subCategories
      .filter(sub =>
        sub.name.toLowerCase().includes(subCategoriesSearchTerm.toLowerCase())
      )
      .sort((a, b) => naturalSort(a.name, b.name));
  }, [fullCategoriesData, tempMetadata.categories, subCategoriesSearchTerm]);

  const filteredTags = useMemo(() => 
    tagOptions
      .filter(tag =>
        tag.text.toLowerCase().includes(tagsSearchTerm.toLowerCase())
      )
      .sort((a, b) => naturalSort(a.text, b.text)), 
    [tagOptions, tagsSearchTerm]
  );

  const isFormValid = useMemo(() => {
    const isValid = (
      metadata.title.trim().length > 0 && 
      metadata.author.trim().length > 0 && 
      metadata.categories.length > 0 && 
      metadata.subCategories.length > 0 && 
      metadata.tags.length > 0 && 
      (metadata.featuredImage?.length || 0) > 0 &&
      metadata.publishDate.length > 0
    );
        
    return isValid;
  }, [metadata.title, metadata.author, metadata.categories, metadata.subCategories, metadata.tags, metadata.featuredImage, metadata.publishDate]);

  const isModalFormValid = useMemo(() => {
    const isValid = (
      tempMetadata.title.trim().length > 0 && 
      tempMetadata.author.trim().length > 0 && 
      tempMetadata.categories.length > 0 && 
      tempMetadata.subCategories.length > 0 && 
      tempMetadata.tags.length > 0 && 
      (tempMetadata.featuredImage?.length || 0) > 0 &&
      tempMetadata.publishDate.length > 0
    );
    
   
    return isValid;
  }, [tempMetadata.title, tempMetadata.author, tempMetadata.categories, tempMetadata.subCategories, tempMetadata.tags, tempMetadata.featuredImage, tempMetadata.publishDate]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const updateMetadataField = useCallback((field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'categories') {
      setMetadata(prev => ({
        ...prev,
        categories: value,
        subCategories: []
      }));
    }
  }, []);
  const handleOpenTitleModal = useCallback(() => {
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
 
    setTempMetadata({
      ...metadata,

      subCategories: [...metadata.subCategories],
      tags: [...metadata.tags]
    });
    titleModal.openModal();
  }, [metadata, seoData, titleModal]);

  const handleTitleSave = useCallback(() => {

    setMetadata(tempMetadata);

    updateMetadataField('title', tempMetadata.title);
    updateMetadataField('seoTitle', tempSeoData.title);
    updateMetadataField('seoDescription', tempSeoData.description);
    updateMetadataField('author', tempMetadata.author);
    updateMetadataField('status', tempMetadata.status);
    updateMetadataField('publishDate', tempMetadata.publishDate);
    updateMetadataField('categories', tempMetadata.categories);
    updateMetadataField('subCategories', tempMetadata.subCategories);
    updateMetadataField('tags', tempMetadata.tags);
    updateMetadataField('featuredImage', tempMetadata.featuredImage);


    setSeoData(tempSeoData);
    

    setActiveTab('general');
    titleModal.closeModal();
  }, [tempMetadata, tempSeoData, updateMetadataField, titleModal]);

  const handleTitleCancel = useCallback(() => {

    setTempMetadata({
      ...metadata,
      subCategories: [...metadata.subCategories]
    });
    setTempSeoData({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords
    });
    
    setActiveTab('general');
    titleModal.closeModal();
  }, [metadata, seoData, titleModal]);

  const setFeaturedImageInModal = useCallback((imageUrl: string) => {
    setTempMetadata(prev => ({ ...prev, featuredImage: imageUrl }));
    imageGalleryModal.closeModal();
  }, [imageGalleryModal]);

  const handleSetFeaturedImage = useCallback((imageUrl: string) => {
    console.log('Setting featured image:', imageUrl);
    updateMetadataField('featuredImage', imageUrl);
  }, [updateMetadataField]);

  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      exitConfirmationModal.openModal();
    } else {
      router.push('/admin/blog');
    }
  }, [hasUnsavedChanges, exitConfirmationModal, router]);

  const handleSaveAsDraft = useCallback(async () => {
    try {
      const draftMetadata = { ...metadata, status: 'draft' as const };
      
      const payload = transformBlogDataForAPI(
        draftMetadata,
        currentLayout.blocks,
        categoryOptions,
        tagOptions,
        fullCategoriesData
      );


      updateBlogPost({
        id,
        data: payload
      }, {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          exitConfirmationModal.closeModal();
          router.push('/admin/blog');
        },
        onError: (error) => {
          console.error('Error saving draft:', error);
        }
      });
    } catch (error) {
      console.error('Error preparing draft data:', error);
    }
  }, [metadata, currentLayout, categoryOptions, tagOptions, fullCategoriesData, id, updateBlogPost, exitConfirmationModal, router]);

  const handleExitWithoutSaving = useCallback(() => {
    setHasUnsavedChanges(false);
    exitConfirmationModal.closeModal();
    router.push('/admin/blog');
  }, [exitConfirmationModal, router]);

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
    if (childAddBlock) {
      childAddBlock(blockType);
    } else {
     
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

  const handleAddBlockRef = useCallback((addBlockFn: (type: BlockType) => void) => {
    setChildAddBlock(() => addBlockFn);
  }, []);

  const saveBlog = useCallback(async () => {
    try {
    

      const payload = transformBlogDataForAPI(
        metadata,
        currentLayout.blocks,
        categoryOptions,
        tagOptions,
        fullCategoriesData
      );

    
      const validation = validateBlogData(payload);

      if (!validation.isValid) {
        console.error('Payload validation failed:', validation.errors);
        return;
      }

      updateBlogPost(
        { id, data: payload },
        {
          onSuccess: () => {
          
            router.push('/admin/blog');
          },
          onError: (error) => {
            console.error('Error updating blog:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error preparing blog data:', error);
    }
  }, [metadata, currentLayout, categoryOptions, tagOptions, fullCategoriesData, id, router, updateBlogPost]);

  if (isPageLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading blog data..." />;
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

            <div className="flex items-center space-x-3">
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
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={saveBlog}
              disabled={isUpdating || !isFormValid}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              {isUpdating 
                ? 'Saving...' 
                : metadata.status === 'published' 
                  ? 'Update & Publish' 
                  : metadata.status === 'draft'
                    ? 'Save as Draft'
                    : 'Save Changes'
              }
            </Button>
          </div>
        </div>

     
        <div className="h-[calc(100vh-80px)] flex">
       
          <div className="flex-1 bg-white">
            <div className="h-full">
              <div className="h-full relative">
                <div className="h-full relative bg-gray-100">
                  <VisualLayoutBuilder
                    initialLayout={currentLayout.blocks}
                    onLayoutChange={layoutUpdate}
                    blogData={metadata}
                    onAddBlockRef={handleAddBlockRef}
                    onSetFeaturedImage={handleSetFeaturedImage}
                    currentFeaturedImage={metadata.featuredImage}
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
      <Modal
        isOpen={titleModal.isOpen}
        onClose={handleTitleCancel}
        showCloseButton={false}
        isFullscreen={false}
        className="max-w-4xl w-full mx-auto my-8 rounded-lg shadow-xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Edit Blog Title & SEO Settings</h2>
          
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
                  value={tempMetadata.title}
                  onChange={(e) => setTempMetadata(prev => ({ ...prev, title: e.target.value }))}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Posted <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={tempMetadata.publishDate ? new Date(tempMetadata.publishDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString();
                    setTempMetadata(prev => ({ ...prev, publishDate: selectedDate }));
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100"
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <span>
                      {tempMetadata.categories ? 
                        (categoryOptions.find(cat => cat.value === tempMetadata.categories)?.text || 'Select Category') : 
                        'Select Category'
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
                            setTempMetadata(prev => ({ ...prev, categories: category.value, subCategories: [] }));
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
                  SubCategories  <span className="text-red-500">*</span>
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
                              'No subcategories found matching your search.' : 
                              'No subcategories available for this category.'
                            }
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        Select subcategories for more specific categorization. Please select a category first.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors text-left flex items-center justify-between"
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
                            onClick={() => {
                              setTempMetadata(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tagId)
                              }));
                            }}
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
                <div className="flex items-center space-x-4">
                  {tempMetadata.featuredImage ? (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={tempMetadata.featuredImage} 
                        alt="Featured" 
                        className="w-16 h-16 object-cover rounded border border-gray-300"
                      />
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => imageGalleryModal.openModal()}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Change Image
                        </button>
                        <button
                          onClick={() => setTempMetadata(prev => ({ ...prev, featuredImage: '' }))}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageGalleryModal.openModal()}
                      className="w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    >
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Choose Featured Image</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab Content */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* SEO Title */}
              <div className="mb-4">
                <label htmlFor="seo-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title <span className="text-gray-500">({tempSeoData.title.length}/60 characters)</span>
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
          )}

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
              disabled={!isModalFormValid}
              className="px-4 py-2"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <ImageGalleryModal
        isOpen={imageGalleryModal.isOpen}
        onClose={imageGalleryModal.closeModal}
        onImageSelect={setFeaturedImageInModal}
        onSetFeaturedImage={setFeaturedImageInModal}
        currentFeaturedImage={tempMetadata.featuredImage || ''}
      />

      {/* Exit Confirmation Modal */}
      <BlogExitConfirmationModal
        isOpen={exitConfirmationModal.isOpen}
        onClose={exitConfirmationModal.closeModal}
        onSaveAsDraft={handleSaveAsDraft}
        onExitWithoutSaving={handleExitWithoutSaving}
        blogTitle={metadata.title || "Untitled Blog"}
        isLoading={isUpdating}
        disableSaveAsDraft={!isFormValid}
      />

      <FullScreenSpinner 
        isVisible={isUpdating} 
        message="Updating blog post..." 
      />
    </>
  );
};

export default EditBlogWithLayoutBuilder;
