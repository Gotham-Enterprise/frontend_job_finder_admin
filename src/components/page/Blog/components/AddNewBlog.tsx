"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import DatePicker from "@/components/form/date-picker";
import Radio from "@/components/form/input/Radio";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  allowComments: boolean;
  allowPings: boolean;
  seoTitle: string;
  seoDescription: string;
}

export default function AddNewBlog() {
  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: '',
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

  const categoryOptions = [
    { value: '1', text: 'Technology', selected: false },
    { value: '2', text: 'Design', selected: false },
    { value: '3', text: 'Business', selected: false },
    { value: '4', text: 'Marketing', selected: false },
    { value: '5', text: 'Development', selected: false }
  ];

  const tagOptions = [
    { value: '1', text: 'React', selected: false },
    { value: '2', text: 'TypeScript', selected: false },
    { value: '3', text: 'JavaScript', selected: false },
    { value: '4', text: 'CSS', selected: false },
    { value: '5', text: 'Next.js', selected: false }
  ];

  const initInputChange = (field: keyof BlogPost, value: any) => {
    setBlogPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveDraft = () => {
    setBlogPost(prev => ({ ...prev, status: 'draft' }));
    console.log('Saving draft:', { ...blogPost, status: 'draft' });

  };

  const publishPost = () => {
    setBlogPost(prev => ({ ...prev, status: 'published' }));
    console.log('Publishing post:', { ...blogPost, status: 'published' });

  };

  const handlePreview = () => {
    previewModal.openModal();
  };

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-3">
          Preview Mode
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {blogPost.title || 'Untitled Post'}
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>Published on {new Date(blogPost.publishDate).toLocaleDateString()}</span>
          {blogPost.categories.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>Categories: {blogPost.categories.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      {blogPost.excerpt && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium">{blogPost.excerpt}</p>
        </div>
      )}

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
          {blogPost.content || 'No content yet...'}
        </div>
      </div>

      {blogPost.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Post</h1>
        <p className="text-gray-600 dark:text-gray-400">Create and publish a new blog post</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">            <Input
              type="text"
              placeholder="Enter title here"
              defaultValue={blogPost.title}
              onChange={(e) => initInputChange('title', e.target.value)}
              className="text-2xl font-semibold border-none shadow-none focus:ring-0 p-0 bg-transparent"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Editor Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'write'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Preview
                </button>
              </nav>
            </div>

            {/* Editor Content */}
            <div className="p-6">
              {activeTab === 'write' ? (
                <TextArea
                  placeholder="Tell your story..."
                  rows={20}
                  value={blogPost.content}
                  onChange={(value) => initInputChange('content', value)}
                  className="border-none shadow-none focus:ring-0 resize-none text-base"
                />
              ) : (
                <div className="min-h-[500px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {renderPreview()}
                </div>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Label className="text-base font-medium mb-4">Excerpt</Label>
            <TextArea
              placeholder="Write an excerpt (optional)"
              rows={4}
              value={blogPost.excerpt}
              onChange={(value) => initInputChange('excerpt', value)}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Excerpts are optional hand-crafted summaries of your content.
            </p>
          </div>

          {/* SEO Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowSEOSettings(!showSEOSettings)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-base font-medium text-gray-900 dark:text-white">SEO Settings</h3>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${showSEOSettings ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSEOSettings && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <Label>SEO Title</Label>                  <Input
                    type="text"
                    placeholder="SEO title"
                    defaultValue={blogPost.seoTitle}
                    onChange={(e) => initInputChange('seoTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>SEO Description</Label>
                  <TextArea
                    placeholder="SEO description"
                    rows={3}
                    value={blogPost.seoDescription}
                    onChange={(value) => initInputChange('seoDescription', value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Publish</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Status</Label>
                <Select
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'pending', label: 'Pending Review' },
                    { value: 'published', label: 'Published' },
                    { value: 'private', label: 'Private' }
                  ]}
                  defaultValue={blogPost.status}
                  onChange={(value) => initInputChange('status', value)}
                />
              </div>

              <div>
                <Label className="text-sm">Visibility</Label>
                <div className="space-y-2 mt-2">
                  <Radio
                    id="public"
                    name="visibility"
                    value="public"
                    checked={blogPost.visibility === 'public'}
                    onChange={(value) => initInputChange('visibility', value)}
                    label="Public"
                  />
                  <Radio
                    id="private"
                    name="visibility"
                    value="private"
                    checked={blogPost.visibility === 'private'}
                    onChange={(value) => initInputChange('visibility', value)}
                    label="Private"
                  />
                  <Radio
                    id="password"
                    name="visibility"
                    value="password"
                    checked={blogPost.visibility === 'password'}
                    onChange={(value) => initInputChange('visibility', value)}
                    label="Password Protected"
                  />
                </div>
                
                {blogPost.visibility === 'password' && (
                  <div className="mt-2">                    <Input
                      type="text"
                      placeholder="Enter password"
                      defaultValue={blogPost.password || ''}
                      onChange={(e) => initInputChange('password', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <DatePicker
                  id="publish-date"
                  label="Publish Date"
                  defaultDate={blogPost.publishDate}
                  onChange={(dates, dateString) => {
                    if (dateString) {
                      initInputChange('publishDate', dateString);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <Button
                variant="default"
                onClick={publishPost}
                className="w-full"
              >
                Publish
              </Button>
              <Button
                variant="outline"
                onClick={saveDraft}
                className="w-full"
              >
                Save Draft
              </Button>
              <Button
                variant="ghost"
                onClick={handlePreview}
                className="w-full"
              >
                Preview
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
            <MultiSelect
              label=""
              options={categoryOptions}
              defaultSelected={blogPost.categories}
              onChange={(selected) => initInputChange('categories', selected)}
            />
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
            <MultiSelect
              label=""
              options={tagOptions}
              defaultSelected={blogPost.tags}
              onChange={(selected) => initInputChange('tags', selected)}
            />
          </div>

          {/* Discussion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Discussion</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={blogPost.allowComments}
                  onChange={(e) => initInputChange('allowComments', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow comments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={blogPost.allowPings}
                  onChange={(e) => initInputChange('allowPings', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow trackbacks and pingbacks</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
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