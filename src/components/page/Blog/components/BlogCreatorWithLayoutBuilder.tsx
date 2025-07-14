import React, { useState } from 'react';
import BlogTitle from '@/components/page/Blog/components/AddNewBlog/BlogTitle';
import { BlogLayout, convertLayoutToBlogPayload } from '@/services/types/visualLayoutTypes';
import { CreateBlogPostPayload } from '@/services/types/blogPayload';
import { ProcessedImage } from '@/services/utils/imageResizer';

const BlogCreatorWithLayoutBuilder: React.FC = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    permalink: '',
    content: '',
    status: 'draft' as const,
    visibility: 'public' as const,
    categories: [] as string[],
    tags: [] as string[],
    allowComments: true,
    allowPings: true,
    publishDate: new Date().toISOString(),
  });

  const [currentLayout, setCurrentLayout] = useState<BlogLayout | null>(null);
  const [featuredImage, setFeaturedImage] = useState<ProcessedImage | null>(null);

  // Handle title changes
  const changeTitleAndGenerateSlug = (newTitle: string) => {
    setBlogData(prev => ({
      ...prev,
      title: newTitle,
    }));
  };

  // Handle permalink changes
  const changePermalink = (newPermalink: string) => {
    setBlogData(prev => ({
      ...prev,
      permalink: newPermalink,
    }));
  };

  // Handle featured image upload
  const processImageUpload = (file: File) => {
    console.log('Processing regular image upload:', file.name);
    // This would typically upload to your image service
    // For now, we'll create a preview
    const previewUrl = URL.createObjectURL(file);
    
    // Simulate processed image
    const processedImage: ProcessedImage = {
      file,
      dataUrl: previewUrl,
      dimensions: {
        width: 800,
        height: 600,
      },
      size: file.size,
    };
    
    setFeaturedImage(processedImage);
  };

  // Handle processed image from resize modal
  const processResizedImageUpload = (processedImage: ProcessedImage) => {
    console.log('Processing resized image:', {
      width: processedImage.dimensions.width,
      height: processedImage.dimensions.height,
      size: processedImage.size,
      fileSize: processedImage.file.size,
    });
    
    setFeaturedImage(processedImage);
  };

  // Handle layout changes from the visual builder
  const updateLayoutFromBuilder = (layout: BlogLayout) => {
    console.log('Layout updated from builder:', layout);
    setCurrentLayout(layout);
    
    // Update the content with the generated HTML from the layout
    const htmlContent = convertLayoutToHtml(layout);
    setBlogData(prev => ({
      ...prev,
      content: htmlContent,
    }));
  };

  // Handle final blog save from layout builder
  const saveBlogFromLayoutBuilder = (payload: any) => {
    console.log('Complete blog payload from layout builder:', payload);
    
    // This is your final payload that combines:
    // 1. Blog metadata (title, permalink, etc.)
    // 2. Visual layout structure
    // 3. Generated HTML content
    // 4. Featured image references (not base64!)
    
    // Send to your backend
    submitBlogPost(payload);
  };

  // Convert layout to clean HTML (for the content field)
  const convertLayoutToHtml = (layout: BlogLayout): string => {
    return layout.blocks.map(block => {
      switch (block.type) {
        case 'heading':
          const headingContent = block.content as any;
          return `<h${headingContent.level}>${headingContent.text}</h${headingContent.level}>`;
        
        case 'paragraph':
          const paragraphContent = block.content as any;
          return `<p>${paragraphContent.text}</p>`;
        
        case 'image':
          const imageContent = block.content as any;
          return `<img src="${imageContent.url}" alt="${imageContent.alt}" style="width: 100%; height: auto;" />`;
        
        case 'quote':
          const quoteContent = block.content as any;
          return `<blockquote><p>${quoteContent.text}</p>${quoteContent.author ? `<cite>— ${quoteContent.author}</cite>` : ''}</blockquote>`;
        
        case 'list':
          const listContent = block.content as any;
          const listTag = listContent.ordered ? 'ol' : 'ul';
          const items = listContent.items.map((item: string) => `<li>${item}</li>`).join('');
          return `<${listTag}>${items}</${listTag}>`;
        
        case 'code':
          const codeContent = block.content as any;
          return `<pre><code class="language-${codeContent.language}">${codeContent.code}</code></pre>`;
        
        case 'hero':
          const heroContent = block.content as any;
          return `
            <div class="hero-section" style="text-align: center; padding: 80px 32px; ${heroContent.backgroundUrl ? `background-image: url(${heroContent.backgroundUrl}); background-size: cover;` : ''}">
              <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">${heroContent.title}</h1>
              ${heroContent.subtitle ? `<p style="font-size: 1.25rem; margin-bottom: 1.5rem;">${heroContent.subtitle}</p>` : ''}
              ${heroContent.ctaButton ? `<a href="${heroContent.ctaButton.url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">${heroContent.ctaButton.text}</a>` : ''}
            </div>
          `;
        
        default:
          return '';
      }
    }).join('\n');
  };

  // Submit the final blog post
  const submitBlogPost = async (layoutPayload?: any) => {
    try {
      // Create the final payload
      const finalPayload: CreateBlogPostPayload = {
        // Basic blog information
        title: blogData.title,
        permalink: blogData.permalink,
        content: layoutPayload ? layoutPayload.content : blogData.content,
        excerpt: blogData.content.substring(0, 200) + '...',
        
        // Publishing options
        status: blogData.status,
        visibility: blogData.visibility,
        publishDate: blogData.publishDate,
        
        // Content organization
        categories: blogData.categories,
        tags: blogData.tags,
        
        // Featured image (URL reference, not base64!)
        featuredImage: featuredImage ? {
          url: featuredImage.dataUrl,
          alt: `Featured image for ${blogData.title}`,
          width: featuredImage.dimensions.width,
          height: featuredImage.dimensions.height,
        } : undefined,
        

        seoTitle: blogData.title,
        seoDescription: blogData.content.substring(0, 160),

        allowComments: blogData.allowComments,
        allowPings: blogData.allowPings,
        
        ...(currentLayout && {
          layout: {
            version: '1.0',
            blocks: currentLayout.blocks,
            settings: currentLayout.settings,
          }
        }),
        
        // Metadata
        wordCount: blogData.content.split(' ').length,
        readingTime: Math.ceil(blogData.content.split(' ').length / 200),
      };

   
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      const result = await response.json();
    
  
      alert('Blog post created successfully!');

    } catch (error) {
      console.error('❌ Failed to create blog post:', error);
      alert('Failed to create blog post. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Blog Post
        </h1>
        
        {/* Enhanced Blog Title Component with Layout Builder */}
        <BlogTitle
          title={blogData.title}
          permalink={blogData.permalink}
          onChange={changeTitleAndGenerateSlug}
          onPermalinkChange={changePermalink}
          onImageUpload={processImageUpload}
          onProcessedImageUpload={processResizedImageUpload}
          onLayoutChange={updateLayoutFromBuilder}
          onBlogSave={saveBlogFromLayoutBuilder}
        />
      </div>

      {/* Additional Blog Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </label>
              <input
                type="text"
                placeholder="Technology, Web Development, React..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => setBlogData(prev => ({
                  ...prev,
                  categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="react, typescript, tutorial..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => setBlogData(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
              />
            </div>
          </div>
        </div>

        {/* Publishing Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Publishing Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={blogData.status}
                onChange={(e) => setBlogData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <select
                value={blogData.visibility}
                onChange={(e) => setBlogData(prev => ({ ...prev, visibility: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password">Password Protected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Content Editor (if not using layout builder) */}
      {!currentLayout && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Editor
          </h3>
          <textarea
            value={blogData.content}
            onChange={(e) => setBlogData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your blog content here... Or use the Layout Builder for a visual experience!"
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>
      )}

      {/* Layout Preview */}
      {currentLayout && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Layout Preview
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ✅ Using visual layout with {currentLayout.blocks.length} blocks
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded p-4 bg-gray-50 dark:bg-gray-700">
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                layoutName: currentLayout.name,
                blocksCount: currentLayout.blocks.length,
                blockTypes: currentLayout.blocks.map(b => b.type),
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => submitBlogPost()}
          disabled={!blogData.title || (!blogData.content && !currentLayout)}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Publish Blog Post
        </button>
        
        <button
          onClick={() => setBlogData(prev => ({ ...prev, status: 'draft' }))}
          className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Save as Draft
        </button>
      </div>

      {/* Debug Information */}
      <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
          Debug Information
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Blog Data:</h4>
            <pre className="text-xs bg-white dark:bg-gray-700 p-3 rounded overflow-auto">
              {JSON.stringify(blogData, null, 2)}
            </pre>
          </div>
          
          {featuredImage && (
            <div>
              <h4 className="text-sm font-medium mb-2">Featured Image:</h4>
              <pre className="text-xs bg-white dark:bg-gray-700 p-3 rounded overflow-auto">
                {JSON.stringify({
                  width: featuredImage.dimensions.width,
                  height: featuredImage.dimensions.height,
                  processedSize: featuredImage.size,
                  originalFileSize: featuredImage.file.size,
                  fileName: featuredImage.file.name,
                }, null, 2)}
              </pre>
            </div>
          )}
          
          {currentLayout && (
            <div>
              <h4 className="text-sm font-medium mb-2">Current Layout:</h4>
              <pre className="text-xs bg-white dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(currentLayout, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export default BlogCreatorWithLayoutBuilder;
