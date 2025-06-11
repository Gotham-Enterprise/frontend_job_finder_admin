"use client";
import React, { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { openBlogPreview } from "./blogPreview";
import {
  BlogTitle,
  BlogContentEditor,
  BlogTemplatesSelector,
  BlogSEOSettings,
  BlogPublishSettings,
  BlogCategoriesSelector,
  BlogTagsSelector,
  BlogPreview
} from "./AddNewBlog/";
import { BlogPost, CategoryOption, TagOption } from "@/services/types/blogPostType";

export default function AddNewBlog() {  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: '',
    permalink: '',
    content: '',
    excerpt: '',
    status: 'draft',
    visibility: 'public',
    publishDate: new Date().toISOString().split('T')[0],
    categories: [],
    tags: [],
    allowComments: true,
    allowPings: true,
    seoTitle: '',
    seoDescription: ''
  });
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showSEOSettings, setShowSEOSettings] = useState(false);
  const previewModal = useModal();

  const categoryOptions: CategoryOption[] = [
    { value: '1', text: 'Technology', selected: false },
    { value: '2', text: 'Design', selected: false },
    { value: '3', text: 'Business', selected: false },
    { value: '4', text: 'Marketing', selected: false },
    { value: '5', text: 'Development', selected: false }
  ];

  const tagOptions: TagOption[] = [
    { value: '1', text: 'React', selected: false },
    { value: '2', text: 'TypeScript', selected: false },
    { value: '3', text: 'JavaScript', selected: false },
    { value: '4', text: 'CSS', selected: false },
    { value: '5', text: 'Next.js', selected: false }
  ];
  const initInputChange = useCallback((field: keyof BlogPost, value: any) => {
    setBlogPost(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const titleChange = useCallback((title: string) => {
    initInputChange('title', title);
  }, [initInputChange]);

  const permalinkChange = useCallback((permalink: string) => {
    initInputChange('permalink', permalink);
  }, [initInputChange]);
  const saveDraft = () => {
    setBlogPost(prev => ({ ...prev, status: 'draft' }));
    

    const categoryNames = blogPost.categories.map(id => 
      categoryOptions.find(option => option.value === id)?.text || id
    );
    const tagNames = blogPost.tags.map(id => 
      tagOptions.find(option => option.value === id)?.text || id
    );
    
    console.log('Saving draft:', { 
      ...blogPost, 
      status: 'draft',
      categories: categoryNames,
      tags: tagNames
    });
  };
  const publishPost = () => {
    setBlogPost(prev => ({ ...prev, status: 'published' }));
    
    const categoryNames = blogPost.categories.map(id => 
      categoryOptions.find(option => option.value === id)?.text || id
    );
    const tagNames = blogPost.tags.map(id => 
      tagOptions.find(option => option.value === id)?.text || id
    );
  
  };
  
  const initPreview = () => {
    openBlogPreview(blogPost, categoryOptions, tagOptions);
  };

  const renderPreview = () => (
    <BlogPreview 
      blogPost={blogPost} 
      categoryOptions={categoryOptions}
      tagOptions={tagOptions}
    />
  );

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Post</h1>
        <p className="text-gray-600 dark:text-gray-400">Create and publish a new blog post</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 space-y-6">          <BlogTitle
            title={blogPost.title}
            permalink={blogPost.permalink}
            onChange={titleChange}
            onPermalinkChange={permalinkChange}
          />
            <BlogContentEditor
            content={blogPost.content}
            onChange={(content: string) => initInputChange('content', content)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            renderPreview={renderPreview}
          />

          <BlogTemplatesSelector
            currentContent={blogPost.content}
            onTemplateSelect={(content: string) => initInputChange('content', content)}
          />

          <BlogSEOSettings
            seoTitle={blogPost.seoTitle}
            seoDescription={blogPost.seoDescription}
            showSEOSettings={showSEOSettings}
            onToggleShow={() => setShowSEOSettings(!showSEOSettings)}
            onSeoTitleChange={(title: string) => initInputChange('seoTitle', title)}
            onSeoDescriptionChange={(description: string) => initInputChange('seoDescription', description)}
          />
        </div>

        <div className="space-y-6">
          
          <BlogPublishSettings
            status={blogPost.status}
            visibility={blogPost.visibility}
            password={blogPost.password}
            publishDate={blogPost.publishDate}
            onStatusChange={(status: string) => initInputChange('status', status)}
            onVisibilityChange={(visibility: string) => initInputChange('visibility', visibility)}
            onPasswordChange={(password: string) => initInputChange('password', password)}
            onPublishDateChange={(date: string) => initInputChange('publishDate', date)}
            onPreview={initPreview}
            onSaveDraft={saveDraft}
            onPublish={publishPost}
          />
          
          <BlogCategoriesSelector
            categories={blogPost.categories}
            categoryOptions={categoryOptions}
            onChange={(selected: string[]) => initInputChange('categories', selected)}
          />

          <BlogTagsSelector
            tags={blogPost.tags}
            tagOptions={tagOptions}
            onChange={(selected: string[]) => initInputChange('tags', selected)}
          />
        </div>
      </div>

      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.closeModal}
        className="max-w-6xl"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg max-h-[90vh] overflow-y-auto">
          {renderPreview()}
        </div>
      </Modal>
    </div>
  );
}