"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Input from "@/components/form/input/InputField";
import { generateSlug, sanitizePermalink } from "@/services/utils";
import { Modal } from "@/components/ui/modal";
import ImageUploadWithResize from "@/components/ui/ImageUploadWithResize";
import { ProcessedImage } from "@/services/utils/imageResizer";
import VisualLayoutBuilder from "@/components/page/Blog/components/VisualLayoutBuilder/VisualLayoutBuilder";
import { BlogLayout } from "@/services/types/visualLayoutTypes";

interface BlogTitleProps {
  title: string;
  permalink: string;
  onChange: (title: string) => void;
  onPermalinkChange: (permalink: string) => void;
  onImageUpload?: (file: File) => void;
  onProcessedImageUpload?: (processedImage: ProcessedImage) => void;
  onLayoutChange?: (layout: BlogLayout) => void;
  onBlogSave?: (payload: any) => void;
}

const BlogTitle: React.FC<BlogTitleProps> = ({ 
  title, 
  permalink, 
  onChange, 
  onPermalinkChange,
  onImageUpload,
  onProcessedImageUpload,
  onLayoutChange,
  onBlogSave
}) => {
  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);
  const [permalinkInput, setPermalinkInput] = useState(permalink);
  const [origin, setOrigin] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isLayoutBuilderOpen, setIsLayoutBuilderOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const previousTitleRef = useRef(title);
  const previousPermalinkRef = useRef(permalink);
  const onPermalinkChangeRef = useRef(onPermalinkChange);


  useEffect(() => {
    onPermalinkChangeRef.current = onPermalinkChange;
  }, [onPermalinkChange]);


  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);


  const shouldUpdatePermalink = useMemo(() => {
    return permalink !== previousPermalinkRef.current && 
           permalink !== permalinkInput && 
           !isPermalinkManuallyEdited;
  }, [permalink, permalinkInput, isPermalinkManuallyEdited]);

  useEffect(() => {
    if (shouldUpdatePermalink) {
      setPermalinkInput(permalink);
      previousPermalinkRef.current = permalink;
    }
  }, [shouldUpdatePermalink, permalink]);


  useEffect(() => {
    const currentTitle = title.trim();
    const previousTitle = previousTitleRef.current;
    
    if (currentTitle !== previousTitle && !isPermalinkManuallyEdited) {
      if (currentTitle) {
        const newPermalink = generateSlug(currentTitle);
        setPermalinkInput(newPermalink);
        onPermalinkChangeRef.current(newPermalink);
      } else if (previousTitle) {
      
        setPermalinkInput('');
        onPermalinkChangeRef.current('');
      }
    }
    
    previousTitleRef.current = currentTitle;
  }, [title, isPermalinkManuallyEdited]);


  const titleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const permalinkChange = useCallback((value: string) => {
    setIsPermalinkManuallyEdited(true);
    const sanitizedValue = sanitizePermalink(value);
    setPermalinkInput(sanitizedValue);
    onPermalinkChangeRef.current(sanitizedValue);
  }, []);

  const permalinkInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    permalinkChange(e.target.value);
  }, [permalinkChange]);

  const imageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageUpload?.(file);
      setIsModalOpen(false); 
    }
  }, [onImageUpload]);

  // Handle processed image from resize modal
  const handleProcessedImageSelect = useCallback((processedImage: ProcessedImage) => {
    setSelectedImage(processedImage.file);
    setPreviewUrl(processedImage.dataUrl);
    onProcessedImageUpload?.(processedImage);
    setIsResizeModalOpen(false);
  }, [onProcessedImageUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      imageUpload(imageFile);
    }
  }, [imageUpload]);

  const drageOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const dragleave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      imageUpload(file);
      setIsModalOpen(false);
    }
  }, [imageUpload]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openLayoutBuilder = useCallback(() => {
    setIsLayoutBuilderOpen(true);
  }, []);

  const closeLayoutBuilder = useCallback(() => {
    setIsLayoutBuilderOpen(false);
  }, []);

  const saveLayoutFromBuilder = useCallback((layout: BlogLayout) => {
    onLayoutChange?.(layout);
    setIsLayoutBuilderOpen(false);
  }, [onLayoutChange]);

  const saveBlogFromBuilder = useCallback((payload: any) => {
    onBlogSave?.(payload);
    console.log('Blog payload from layout builder:', payload);
  }, [onBlogSave]);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const originDisplay = useMemo(() => `${origin}/blog/`, [origin]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">      <Input
        type="text"
        placeholder="Enter title"
        defaultValue={title}
        onChange={titleChange}
        className="text-2xl font-semibold border-none shadow-none focus:ring-0 p-0 bg-transparent"
      />
      
   

      {/* Image Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 flex flex-row gap-2 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd"></path><path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z" clipRule="evenodd"></path></svg>
              Quick Upload
            </button>
            
            <button
              onClick={() => setIsResizeModalOpen(true)}
              className="px-4 flex flex-row gap-2 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd"></path><path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z" clipRule="evenodd"></path></svg>
              Upload & Resize
            </button>
          </div>
          
          <button
            onClick={() => setIsLayoutBuilderOpen(true)}
            className="px-4 flex flex-row gap-2 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.857 3A1.857 1.857 0 0 0 3 4.857v4.286C3 10.169 3.831 11 4.857 11h4.286A1.857 1.857 0 0 0 11 9.143V4.857A1.857 1.857 0 0 0 9.143 3H4.857Zm10 0A1.857 1.857 0 0 0 13 4.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 9.143V4.857A1.857 1.857 0 0 0 19.143 3h-4.286Zm-10 10A1.857 1.857 0 0 0 3 14.857v4.286C3 20.169 3.831 21 4.857 21h4.286A1.857 1.857 0 0 0 11 19.143v-4.286A1.857 1.857 0 0 0 9.143 13H4.857Zm10 0A1.857 1.857 0 0 0 13 14.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 19.143v-4.286A1.857 1.857 0 0 0 19.143 13h-4.286Z" clipRule="evenodd"/>
            </svg>
            Layout Builder
          </button>
        </div>

        {previewUrl && (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Selected"
              className="max-w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isFullscreen={false} className="max-w-md mx-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Image
          </h3>
          
          <div
            onDrop={onDrop}
            onDragOver={drageOver}
            onDragLeave={dragleave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
            onClick={openFileDialog}
          >
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>
                {' '}or drag and drop
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF up to 10MB - Will be inserted into the editor
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Resize Modal */}
      <Modal isOpen={isResizeModalOpen} onClose={() => setIsResizeModalOpen(false)} isFullscreen={true}>
        <div className="h-full">
          <ImageUploadWithResize
            isOpen={isResizeModalOpen}
            onImageSelect={handleProcessedImageSelect}
            onClose={() => setIsResizeModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Visual Layout Builder Modal */}
      <Modal isOpen={isLayoutBuilderOpen} onClose={closeLayoutBuilder} isFullscreen={true}>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Visual Layout Builder
            </h2>
            <button
              onClick={closeLayoutBuilder}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-[calc(100vh-80px)]">
            <VisualLayoutBuilder
              onLayoutChange={saveLayoutFromBuilder}
              onSave={saveBlogFromBuilder}
              blogData={{
                title,
                permalink,
                // Add any other blog data you want to pass
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogTitle;
