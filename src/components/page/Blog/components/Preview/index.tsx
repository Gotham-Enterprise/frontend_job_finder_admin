"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogApi } from '@/services/api/blog';
import { BlogPost } from '@/services/types/blog';
import { formatDate } from '@/services/utils/dateUtils';
import { ArrowRightIcon, CalenderIcon, UserIcon } from '@/icons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

interface BlogPreviewProps {
  blogId: string;
}

interface BlockContent {
  time: number;
  blocks: Array<{
    id: string;
    type: string;
    styles?: any;
    content?: any;
    position?: any;
    metadata?: any;
  }>;
  version: string;
}

interface BlogContentRendererProps {
  content: BlockContent;
}

const isBlockContent = (content: any): content is BlockContent => {
  return content && typeof content === 'object' && 'blocks' in content && Array.isArray(content.blocks);
};

const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  const renderBlock = (block: any) => {
    const { type, content: blockContent, styles = {} } = block;
    
    const createInlineStyles = (blockStyles: any) => {
      const style: React.CSSProperties = {};
      
      if (blockStyles.margin) {
        style.marginTop = blockStyles.margin.top || 0;
        style.marginBottom = blockStyles.margin.bottom || 0;
        style.marginLeft = blockStyles.margin.left || 0;
        style.marginRight = blockStyles.margin.right || 0;
      }
      
      if (blockStyles.padding) {
        style.paddingTop = blockStyles.padding.top || 0;
        style.paddingBottom = blockStyles.padding.bottom || 0;
        style.paddingLeft = blockStyles.padding.left || 0;
        style.paddingRight = blockStyles.padding.right || 0;
      }
      
      if (blockStyles.fontSize) style.fontSize = blockStyles.fontSize;
      if (blockStyles.fontWeight) style.fontWeight = blockStyles.fontWeight;
      if (blockStyles.textAlign) style.textAlign = blockStyles.textAlign as any;
      if (blockStyles.color) style.color = blockStyles.color;
      
      return style;
    };

    const blockStyle = createInlineStyles(styles);

    switch (type) {
      case 'heading':
        const level = blockContent?.level || 1;
        const headingLevel = Math.min(level, 6);
        
        const headingElements = {
          1: (props: any) => <h1 {...props} />,
          2: (props: any) => <h2 {...props} />,
          3: (props: any) => <h3 {...props} />,
          4: (props: any) => <h4 {...props} />,
          5: (props: any) => <h5 {...props} />,
          6: (props: any) => <h6 {...props} />
        };
        
        const HeadingComponent = headingElements[headingLevel as keyof typeof headingElements];
        
        return (
          <HeadingComponent
            key={block.id}
            style={blockStyle}
            className="font-bold text-gray-900"
          >
            {blockContent?.text || ''}
          </HeadingComponent>
        );

      case 'paragraph':
        return (
          <div 
            key={block.id} 
            style={blockStyle}
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: blockContent?.text || '' 
            }}
          />
        );

      case 'image':
        return (
          <div key={block.id} style={blockStyle} className="my-6">
            <img
              src={blockContent?.url}
              alt={blockContent?.alt || 'Blog image'}
              className="max-w-full h-auto rounded-lg shadow-sm"
              style={{
                width: styles.width ? `${styles.width}${styles.widthUnit || 'px'}` : 'auto',
                height: styles.height ? `${styles.height}${styles.heightUnit || 'px'}` : 'auto',
                borderRadius: styles.border?.radius || 8,
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div key={block.id} style={blockStyle} className="my-6">
            <video
              src={blockContent?.url}
              controls={blockContent?.controls !== false}
              autoPlay={blockContent?.autoplay || false}
              muted={blockContent?.muted || false}
              className="max-w-full h-auto rounded-lg shadow-sm"
              style={{
                width: styles.width ? `${styles.width}${styles.widthUnit || 'px'}` : '100%',
                height: styles.height ? `${styles.height}${styles.heightUnit || 'px'}` : 'auto',
                borderRadius: styles.border?.radius || 8,
                aspectRatio: blockContent?.aspectRatio || 'auto',
              }}
            >
              <source src={blockContent?.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {blockContent?.title && (
              <p className="text-sm text-gray-600 mt-2 italic">
                {blockContent.title}
              </p>
            )}
          </div>
        );

      case 'list':
        const ListTag = blockContent?.ordered ? 'ol' : 'ul';
        return (
          <ListTag key={block.id} style={blockStyle} className="space-y-2">
            {blockContent?.items?.map((item: string, index: number) => (
              <li 
                key={index} 
                className="text-gray-800"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ListTag>
        );

      case 'quote':
        return (
          <blockquote 
            key={block.id} 
            style={blockStyle}
            className="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-gray-50 py-2"
          >
            {blockContent?.text || ''}
          </blockquote>
        );

      case 'code':
        return (
          <pre 
            key={block.id} 
            style={blockStyle}
            className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"
          >
            <code>{blockContent?.code || blockContent?.text || ''}</code>
          </pre>
        );

      default:

        return (
          <div 
            key={block.id} 
            style={blockStyle}
            className="text-gray-800"
          >
            {blockContent?.text || JSON.stringify(blockContent)}
          </div>
        );
    }
  };

  return (
    <div className="blog-content">
      {content.blocks?.map(renderBlock)}
    </div>
  );
};

interface BlogPreviewProps {
  blogId: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ blogId }) => {
  const router = useRouter();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        const blogData = await blogApi.getBlogPostById(blogId);
        setBlogPost(blogData);
      } catch (err: any) {

        setError(err.message || 'Failed to fetch blog post');
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlogPost();
    }
  }, [blogId]);

  const handleGoBack = () => {
    if (window.opener) {
      window.opener.location.href = '/admin/blog';
      window.close();
    } else {

      window.location.href = '/admin/blog';
    }
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading blog preview..." />;
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Blog Post</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Back to Admin
            </button>
            <div className="text-sm text-gray-500">
              Blog Preview
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

          {blogPost.featuredImage && typeof blogPost.featuredImage === 'object' && (
            <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden">
              <img
                src={blogPost.featuredImage.url}
                alt={blogPost.featuredImage.alt || blogPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="px-6 py-8 md:px-8 md:py-10">

            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                blogPost.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : blogPost.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {blogPost.status?.charAt(0).toUpperCase() + blogPost.status?.slice(1) || 'Not specified'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blogPost.title}
            </h1>
            {blogPost.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blogPost.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              {/* Author */}
              {blogPost.author && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="mr-2" />
                  <span>By {blogPost.author.name}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <CalenderIcon className="mr-2" />
                <span>Published {formatDate(blogPost.createdAt || blogPost.publishedDate)}</span>
              </div>

              {blogPost.category && (
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {blogPost.category.name}
                  </span>
                </div>
              )}
            </div>
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-3">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag: { id: string; name: string }) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed">
                {typeof blogPost.content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
                ) : isBlockContent(blogPost.content) ? (
                  <BlogContentRenderer content={blogPost.content} />
                ) : blogPost.content ? (
                  <div>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
                      {JSON.stringify(blogPost.content, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
            </div>
          </div>
        </article>
        <div className="mt-8 text-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowRightIcon className="mr-2" />
            Back to Admin Panel
          </button>
        </div>
      </main>
    </div>
  );
};

export default BlogPreview;