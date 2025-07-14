"use client";
import React, { useState, useCallback, useRef } from 'react';
import { BlogLayout, BlogTemplate, BLOG_TEMPLATES, VisualBlogPayload } from '@/services/types/blogLayout';
import { useImageUpload } from '@/services/api/imageService';
import { Modal } from '@/components/ui/modal';

interface VisualBlogBuilderProps {
  onSave: (payload: VisualBlogPayload) => void;
  initialLayout?: BlogLayout;
}

const VisualBlogBuilder: React.FC<VisualBlogBuilderProps> = ({ 
  onSave, 
  initialLayout 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null);
  const [currentLayout, setCurrentLayout] = useState<BlogLayout | null>(initialLayout || null);
  const [showTemplateModal, setShowTemplateModal] = useState(!initialLayout);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const { uploadAndGetReference } = useImageUpload();

  // Get selected component
  const selectedComponent = selectedComponentId && currentLayout 
    ? currentLayout.components.find(comp => comp.id === selectedComponentId)
    : null;

  // Auto-show properties panel when component is selected
  React.useEffect(() => {
    setShowPropertiesPanel(!!selectedComponentId);
  }, [selectedComponentId]);

  // Handle component selection
  const handleComponentClick = useCallback((componentId: string) => {
    setSelectedComponentId(componentId);
  }, []);

  // Update component content
  const updateComponent = useCallback((componentId: string, updates: any) => {
    if (!currentLayout) return;
    
    setCurrentLayout(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        components: prev.components.map(comp => {
          if (comp.id === componentId) {
            // Handle style updates vs content updates
            const isStyleUpdate = ['borderRadius', 'boxShadow', 'opacity', 'transform'].some(key => key in updates);
            
            if (isStyleUpdate) {
              return {
                ...comp,
                styles: { ...comp.styles, ...updates }
              };
            } else {
              return {
                ...comp,
                content: { ...comp.content, ...updates }
              };
            }
          }
          return comp;
        })
      };
    });
  }, [currentLayout]);

  // Template selection
  const selectTemplate = useCallback((template: BlogTemplate) => {
    setSelectedTemplate(template);
    setCurrentLayout(template.layout);
    setShowTemplateModal(false);
  }, []);

  // Generate final payload
  const generatePayload = useCallback((): VisualBlogPayload => {
    if (!currentLayout || !selectedTemplate) {
      throw new Error('No layout selected');
    }

    // Convert layout to HTML
    const generatedHtml = generateHtmlFromLayout(currentLayout);

    return {
      title: selectedTemplate.sampleContent.title,
      permalink: generateSlug(selectedTemplate.sampleContent.title),
      excerpt: selectedTemplate.sampleContent.excerpt,
      layout: currentLayout,
      images: {}, // Will be populated as images are uploaded
      generatedHtml,
      status: 'draft',
      visibility: 'public',
      publishDate: new Date().toISOString().split('T')[0],
      seoTitle: selectedTemplate.sampleContent.seoTitle,
      seoDescription: selectedTemplate.sampleContent.seoDescription,
      categories: selectedTemplate.sampleContent.categories,
      tags: selectedTemplate.sampleContent.tags,
      allowComments: true,
      featuredPost: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 'current-user' // Replace with actual user ID
    };
  }, [currentLayout, selectedTemplate]);

  const handleSave = useCallback(() => {
    try {
      const payload = generatePayload();
      onSave(payload);
    } catch (error) {
      console.error('Failed to generate payload:', error);
    }
  }, [generatePayload, onSave]);

  // Template selection modal
  const TemplateSelectionModal = () => (
    <Modal 
      isOpen={showTemplateModal} 
      onClose={() => setShowTemplateModal(false)}
      className="max-w-6xl"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Choose a Blog Template
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_TEMPLATES.map((template) => (
            <div
              key={template.id}
              onClick={() => selectTemplate(template)}
              className="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img 
                  src={template.thumbnail} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder
                    (e.target as HTMLImageElement).src = '/placeholder-template.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {template.category}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );

  // Layout renderer
  const renderLayout = () => {
    if (!currentLayout) return null;

    return (
      <div 
        className="blog-layout-container"
        style={{ 
          maxWidth: currentLayout.settings.maxWidth,
          backgroundColor: currentLayout.settings.backgroundColor,
          fontFamily: currentLayout.settings.fontFamily,
          margin: '0 auto',
          padding: '2rem'
        }}
      >
        {currentLayout.components.map((component) => (
          <div
            key={component.id}
            className="blog-component"
            style={{
              position: 'relative',
              width: component.position.width,
              height: component.position.height,
              ...component.styles
            }}
          >
            {renderComponent(component)}
          </div>
        ))}
      </div>
    );
  };

  // Component renderer
  const renderComponent = (component: any) => {
    switch (component.type) {
      case 'heading':
        return React.createElement(
          `h${component.content.level}`,
          { style: component.styles },
          component.content.text
        );
      
      case 'text':
        return (
          <div 
            style={component.styles}
            dangerouslySetInnerHTML={{ __html: component.content.html }}
          />
        );
      
      case 'image':
        return (
          <div 
            className={`relative cursor-pointer border-2 ${
              selectedComponentId === component.id 
                ? 'border-blue-500' 
                : 'border-gray-300 hover:border-blue-400'
            } rounded-lg overflow-hidden transition-colors`}
            onClick={() => handleComponentClick(component.id)}
            style={{ 
              minHeight: '200px', 
              width: component.content.width || '100%',
              height: component.content.height || 'auto',
              ...component.styles 
            }}
          >
            {component.content.url ? (
              <img
                src={component.content.url}
                alt={component.content.alt || 'Image'}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: component.content.objectFit || 'cover'
                }}
                loading={component.content.lazy ? 'lazy' : 'eager'}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 min-h-[200px]">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Click to add image</p>
                  <p className="text-xs text-gray-400 mt-1">Drag & drop supported</p>
                </div>
              </div>
            )}
            
            {/* Selection indicator */}
            {selectedComponentId === component.id && (
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs">
                  ✏️
                </div>
              </div>
            )}
          </div>
        );
      
      case 'quote':
        return (
          <blockquote style={component.styles}>
            <p>"{component.content.text}"</p>
            {component.content.author && (
              <cite>— {component.content.author}</cite>
            )}
          </blockquote>
        );
      
      default:
        return <div>Unknown component type: {component.type}</div>;
    }
  };

  // Properties Panel Component
  const PropertiesPanel: React.FC<{
    component: any;
    isVisible: boolean;
    onClose: () => void;
    onUpdate: (componentId: string, updates: any) => void;
  }> = ({ component, isVisible, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'style' | 'settings'>('settings');
    const [isDragOver, setIsDragOver] = useState(false);

    if (!component) return null;

    // Handle drag and drop for images
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        const file = imageFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onUpdate(component.id, {
              url: event.target.result as string,
              alt: file.name.replace(/\.[^/.]+$/, ""),
              width: component.content.width || '100%',
              height: component.content.height || 'auto',
              objectFit: component.content.objectFit || 'cover'
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onUpdate(component.id, {
              url: event.target.result as string,
              alt: file.name.replace(/\.[^/.]+$/, ""),
              width: component.content.width || '100%',
              height: component.content.height || 'auto',
              objectFit: component.content.objectFit || 'cover'
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const renderImageSettings = () => (
      <div className="space-y-6">
        {/* Alt Text */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Alt Text
          </label>
          <input
            type="text"
            value={component.content.alt || ''}
            onChange={(e) => onUpdate(component.id, { alt: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Image description"
          />
        </div>

        {/* Image Upload/Display */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Image
          </label>
          
          {component.content.url ? (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative border border-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={component.content.url} 
                  alt="Preview" 
                  className="w-full object-cover"
                  style={{ 
                    height: '200px',
                    objectFit: component.content.objectFit || 'cover'
                  }}
                />
                <button
                  onClick={() => onUpdate(component.id, { url: '', width: '100%', height: 'auto' })}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors shadow-lg"
                  title="Remove image"
                >
                  ×
                </button>
              </div>

              {/* Image Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Width
                  </label>
                  <input
                    type="text"
                    value={component.content.width || '100%'}
                    onChange={(e) => onUpdate(component.id, { width: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={component.content.height || 'auto'}
                    onChange={(e) => onUpdate(component.id, { height: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="auto"
                  />
                </div>
              </div>

              {/* Object Fit */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Image Fit
                </label>
                <select
                  value={component.content.objectFit || 'cover'}
                  onChange={(e) => onUpdate(component.id, { objectFit: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
              </div>

              {/* Replace Image Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-700/30 hover:border-blue-500 hover:bg-blue-500/5'
                }`}
                onClick={() => document.getElementById(`image-input-${component.id}`)?.click()}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 border border-gray-500 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-300">
                    <div className="font-medium">Replace image</div>
                    <div className="text-gray-400">Drop files here or click to browse</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-700/20 hover:border-blue-500 hover:bg-blue-500/5'
              }`}
              onClick={() => document.getElementById(`image-input-${component.id}`)?.click()}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-2 border-gray-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 font-medium">Drop files here</div>
                <div className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Drag and drop your image here, or click to browse files
                  <br />
                  <span className="text-gray-500">Supports JPEG, PNG, WebP, GIF</span>
                </div>
              </div>
            </div>
          )}
          
          <input
            id={`image-input-${component.id}`}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );

    return (
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Image Properties
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'style'
                ? 'text-white border-b-2 border-blue-500 bg-gray-700'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-white border-b-2 border-blue-500 bg-gray-700'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Panel Content */}
        <div className="overflow-y-auto h-full pb-20">
          {activeTab === 'settings' && component.type === 'image' && (
            <div className="p-4">
              {renderImageSettings()}
            </div>
          )}
          {activeTab === 'style' && component.type === 'image' && (
            <div className="p-4 space-y-6">
              {/* Border Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Border Radius
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={parseInt(component.styles?.borderRadius?.replace('px', '') || '0')}
                  onChange={(e) => onUpdate(component.id, { borderRadius: `${e.target.value}px` })}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {component.styles?.borderRadius || '0px'}
                </div>
              </div>

              {/* Shadow */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Shadow
                </label>
                <select
                  value={component.styles?.boxShadow || 'none'}
                  onChange={(e) => onUpdate(component.id, { boxShadow: e.target.value === 'none' ? undefined : e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="none">None</option>
                  <option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
                  <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                  <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                  <option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
                </select>
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((parseFloat(component.styles?.opacity || '1') * 100))}
                  onChange={(e) => onUpdate(component.id, { opacity: (parseInt(e.target.value) / 100).toString() })}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round((parseFloat(component.styles?.opacity || '1') * 100))}%
                </div>
              </div>

              {/* Transform */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Rotation
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={parseInt(component.styles?.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || '0')}
                  onChange={(e) => onUpdate(component.id, { transform: `rotate(${e.target.value}deg)` })}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {component.styles?.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || '0'}°
                </div>
              </div>
            </div>
          )}
          {activeTab === 'style' && component.type !== 'image' && (
            <div className="p-4">
              <div className="text-center text-gray-500 text-sm">
                <div className="text-2xl mb-2">🎨</div>
                <p>Style controls for {component.type} coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!currentLayout) {
    return <TemplateSelectionModal />;
  }

  return (
    <div className="visual-blog-builder">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Visual Blog Builder
          </h1>
          <span className="text-sm text-gray-500">
            Template: {selectedTemplate?.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Change Template
          </button>
          
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Blog
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar - Component Library */}
        {!isPreviewMode && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Components
            </h3>
            <div className="space-y-2">
              {[
                { type: 'text', icon: '📝', label: 'Text' },
                { type: 'heading', icon: '📄', label: 'Heading' },
                { type: 'image', icon: '🖼️', label: 'Image' },
                { type: 'quote', icon: '💬', label: 'Quote' },
                { type: 'gallery', icon: '🖼️', label: 'Gallery' },
                { type: 'divider', icon: '➖', label: 'Divider' }
              ].map((comp) => (
                <div
                  key={comp.type}
                  className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:bg-gray-50 dark:hover:bg-gray-800"
                  draggable
                >
                  <span>{comp.icon}</span>
                  <span className="text-sm">{comp.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto transition-all duration-300 ${showPropertiesPanel ? 'mr-80' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-screen">
            {renderLayout()}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        component={selectedComponent}
        isVisible={showPropertiesPanel}
        onClose={() => {
          setSelectedComponentId(null);
          setShowPropertiesPanel(false);
        }}
        onUpdate={updateComponent}
      />

      <TemplateSelectionModal />
    </div>
  );
};

// Utility functions
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateHtmlFromLayout = (layout: BlogLayout): string => {
  // Convert layout components to HTML
  const htmlParts = layout.components.map((component) => {
    switch (component.type) {
      case 'heading':
        return `<h${component.content.level}>${component.content.text}</h${component.content.level}>`;
      case 'text':
        return component.content.html;
      case 'image':
        return `<img src="${component.content.url}" alt="${component.content.alt}" />`;
      case 'quote':
        return `<blockquote><p>"${component.content.text}"</p></blockquote>`;
      default:
        return '';
    }
  });

  return `
    <div class="blog-content" style="max-width: ${layout.settings.maxWidth}; font-family: ${layout.settings.fontFamily};">
      ${htmlParts.join('\n')}
    </div>
  `;
};

export default VisualBlogBuilder;
