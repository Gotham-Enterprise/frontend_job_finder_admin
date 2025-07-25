"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Label from "@/components/form/Label";
import VisualLayoutBuilder from "./VisualLayoutBuilder/VisualLayoutBuilder";
import FloatingElementsPanel from "./VisualLayoutBuilder/components/FloatingElementsPanel";

import { 
  transformBlogDataForAPI, 
  validateBlogData, 
  type BlogMetadata
} from "@/services/utils/blogPayloadUtils";

import { blogApi } from "@/services/api/blog";
import { 
  LayoutBlock, 
  BlockType, 
  BLOCK_TEMPLATES,
  BlogLayout 
} from "@/services/types/visualLayoutTypes";

interface EditBlogWithLayoutBuilderProps {
  blogId: string;
}

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

  // Update handlers
  const updateMetadataField = useCallback((field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin/blog')}
                  variant="outline"
                  size="sm"
                >
                  ← Back to Blog
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Edit Blog Post
                  </h1>
                  <p className="text-sm text-gray-500">ID: {id}</p>
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
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-64px)] flex">
          
          {/* Left Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Basic Information
                </h3>
                
                <div>
                  <Label htmlFor="title">Blog Title</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => updateMetadataField('title', e.target.value)}
                    placeholder="Enter blog title..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    value={metadata.slug}
                    onChange={(e) => updateMetadataField('slug', e.target.value)}
                    placeholder="blog-url-slug"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <textarea
                    value={metadata.excerpt}
                    onChange={(e) => updateMetadataField('excerpt', e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Layout Builder */}
          <div className="flex-1 bg-white">
            <div className="h-full">
              <div className="border-b p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Visual Layout Builder
                </h3>
              </div>

              <div className="h-[calc(100%-64px)] relative">
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
    </>
  );
};

export default EditBlogWithLayoutBuilder;
