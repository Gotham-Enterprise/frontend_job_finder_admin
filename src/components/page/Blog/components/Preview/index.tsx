"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { blogApi } from '@/services/api/blog';
import { BlogPost } from '@/services/types/blog';
import { formatDate } from '@/services/utils/dateUtils';
import { processSlug } from '@/services/utils/slugUtils';
import { ArrowRightIcon, CalenderIcon, UserIcon, GothamLogo } from '@/icons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { SITE_CONFIG, generateBlogUrl } from '@/config/constants';
import { 
  extractBlogOpenGraphData, 
  generateOpenGraphTags, 
  generateTwitterCardTags, 
  generateStructuredData 
} from '@/services/utils/openGraphUtils';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [showLocalhostWarning, setShowLocalhostWarning] = useState(false);

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShare = (platform: keyof typeof shareUrls) => {
    if (isLocalhost) {
      setShowLocalhostWarning(true);
      setTimeout(() => setShowLocalhostWarning(false), 3000);
      return;
    }
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-3">
          <button
            onClick={() => openShare('facebook')}
            className={`w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on Facebook (works on live domains)" : "Share on Facebook"}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button
            onClick={() => openShare('twitter')}
            className={`w-12 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on Twitter (works on live domains)" : "Share on Twitter"}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button
            onClick={() => openShare('linkedin')}
            className={`w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on LinkedIn (works on live domains)" : "Share on LinkedIn"}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>

          <button
            onClick={copyToClipboard}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md relative"
            title="Copy Link"
          >
            {showCopied ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {showCopied && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap shadow-lg">
              Link copied!
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}

          {showLocalhostWarning && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-yellow-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap shadow-lg max-w-xs">
              Social sharing works on live domains only
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-yellow-600 rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex space-x-3">
          <button
            onClick={() => openShare('facebook')}
            className={`w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on Facebook (works on live domains)" : "Share on Facebook"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button
            onClick={() => openShare('twitter')}
            className={`w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on Twitter (works on live domains)" : "Share on Twitter"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button
            onClick={() => openShare('linkedin')}
            className={`w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md ${isLocalhost ? 'opacity-75' : ''}`}
            title={isLocalhost ? "Share on LinkedIn (works on live domains)" : "Share on LinkedIn"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button
            onClick={copyToClipboard}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md relative"
            title="Copy Link"
          >
            {showCopied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {showCopied && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap shadow-lg">
              Link copied!
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
          {showLocalhostWarning && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap shadow-lg">
              Social sharing works on live domains only
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-yellow-600 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

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
        const linkColor = block.styles?.linkColor || '#3b82f6';
        
        return (
          <div key={block.id}>
            <style>
              {`
                .list-${block.id} a {
                  color: ${linkColor} !important;
                  text-decoration: underline;
                }
                .list-${block.id} a:hover {
                  opacity: 0.8;
                }
              `}
            </style>
            <ListTag style={blockStyle} className={`space-y-2 list-${block.id}`}>
              {blockContent?.items?.map((item: string, index: number) => (
                <li 
                  key={index} 
                  className={item.trim() === '' ? "text-gray-400 italic" : "text-gray-800"}
                  dangerouslySetInnerHTML={{ 
                    __html: item.trim() === '' ? `Item ${index + 1}` : item 
                  }}
                />
              ))}
            </ListTag>
          </div>
        );

      case 'quote':
        const quoteText = blockContent?.text || 'Your inspiring quote goes here...';
        const quoteAuthor = blockContent?.author || '';
        const quoteCitation = blockContent?.citation || '';
        const isPlaceholderText = quoteText === 'Your inspiring quote goes here...';
        const isPlaceholderAuthor = !quoteAuthor || quoteAuthor.trim() === '';
        
        return (
          <div key={block.id} style={blockStyle} className="relative">
            <blockquote 
              style={{
                fontStyle: 'italic',
                backgroundColor: styles?.backgroundColor || '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1rem 0',
                position: 'relative' as const,
                paddingLeft: '2rem',
              }}
              className="relative"
            >
              <div 
                style={{
                  position: 'absolute' as const,
                  left: '0',
                  top: '0',
                  bottom: '0',
                  width: '4px',
                  backgroundColor: styles?.accentColor || '#8b5cf6',
                  borderRadius: '2px 0 0 2px',
                }}
              />
              <div 
                className="text-lg leading-relaxed mb-3" 
                style={{ 
                  color: isPlaceholderText ? '#9ca3af' : '#374151',
                  fontStyle: 'italic'
                }}
              >
                &ldquo;{quoteText}&rdquo;
              </div>
              <footer className="text-sm mt-4 pt-3 border-t border-gray-200" style={{ color: '#6b7280' }}>
                {quoteAuthor && <cite className="font-medium not-italic">— {quoteAuthor}</cite>}
                {quoteAuthor && quoteCitation && <span className="mx-2">•</span>}
                {quoteCitation && <span className="italic">{quoteCitation}</span>}
                {isPlaceholderAuthor && (
                  <cite className="font-medium not-italic" style={{ color: '#9ca3af' }}>— Author Name</cite>
                )}
              </footer>
            </blockquote>
          </div>
        );

      case 'button':
        const buttonText = blockContent?.text || 'Click Me';
        const buttonUrl = blockContent?.url;
        const buttonTarget = blockContent?.target || '_self';
        const variant = blockContent?.variant || 'primary';
        const size = blockContent?.size || 'medium';
        const width = blockContent?.width || 'auto';
        const customWidth = blockContent?.customWidth || 200;
        const alignment = blockContent?.alignment || 'left';
        
        const getButtonVariantStyles = (variant: string) => {
          switch (variant) {
            case 'primary':
              return {
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none'
              };
            case 'secondary':
              return {
                backgroundColor: '#6b7280',
                color: '#ffffff',
                border: 'none'
              };
            case 'outline':
              return {
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6'
              };
            default:
              return {
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none'
              };
          }
        };

        const getButtonSizeStyles = (size: string) => {
          switch (size) {
            case 'small':
              return {
                fontSize: '0.875rem',
                padding: '8px 16px'
              };
            case 'medium':
              return {
                fontSize: '1rem',
                padding: '12px 24px'
              };
            case 'large':
              return {
                fontSize: '1.125rem',
                padding: '16px 32px'
              };
            default:
              return {
                fontSize: '1rem',
                padding: '12px 24px'
              };
          }
        };

        const variantStyles = getButtonVariantStyles(variant);
        const sizeStyles = getButtonSizeStyles(size);
        
        const buttonStyle = {
          ...variantStyles,
          ...sizeStyles,
          backgroundColor: styles?.backgroundColor || variantStyles.backgroundColor,
          color: styles?.textColor || variantStyles.color,
          fontSize: styles?.fontSize || sizeStyles.fontSize,
          fontWeight: styles?.fontWeight || '500',
          textAlign: styles?.textAlign || 'center',
          fontFamily: styles?.fontFamily || 'inherit',
          border: styles?.border?.width 
            ? `${styles.border.width}px ${styles.border.style || 'solid'} ${styles.border.color || 'transparent'}`
            : variantStyles.border || 'none',
          borderRadius: styles?.border?.radius ? `${styles.border.radius}px` : '6px',
          padding: styles?.padding 
            ? `${styles.padding.top || 12}px ${styles.padding.right || 24}px ${styles.padding.bottom || 12}px ${styles.padding.left || 24}px`
            : sizeStyles.padding,
          cursor: 'pointer',
          display: 'inline-block',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          width: width === 'full' ? '100%' : width === 'custom' ? `${customWidth}px` : 'auto',
          ...blockStyle
        } as React.CSSProperties;

        const containerClass = `flex w-full ${
          alignment === 'center' ? 'justify-center' : 
          alignment === 'right' ? 'justify-end' : 
          'justify-start'
        }`;

        if (buttonUrl && buttonUrl.trim()) {
          return (
            <div key={block.id} className={containerClass} style={{ margin: '16px 0' }}>
              <a
                href={buttonUrl}
                target={buttonTarget}
                rel={buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
                style={buttonStyle}
                className="hover:opacity-90 transition-opacity"
              >
                {buttonText}
              </a>
            </div>
          );
        }

        return (
          <div key={block.id} className={containerClass} style={{ margin: '16px 0' }}>
            <button
              type="button"
              style={buttonStyle}
              className="hover:opacity-90 transition-opacity"
            >
              {buttonText}
            </button>
          </div>
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
  blogId?: string;
  blogSlug?: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ blogId, blogSlug }) => {
  const router = useRouter();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOpenGraphData = () => {
    if (!blogPost) return null;
    
    const ogData = extractBlogOpenGraphData(blogPost);

    ogData.url = typeof window !== 'undefined' ? window.location.href : generateBlogUrl(processSlug(blogPost.slug || blogPost.title));
    
    return ogData;
  };

  const getAuthorName = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'Unknown Author';
    
    const metadataAuthor = (blogPost as any)?.metadata?.author;
    if (metadataAuthor) {
      return metadataAuthor.name || `${metadataAuthor.firstName || ''} ${metadataAuthor.lastName || ''}`.trim() || 'Unknown Author';
    }
    

    if (typeof blogPost.author === 'string') {
      return blogPost.author;
    } else if (blogPost.author && typeof blogPost.author === 'object') {
      return blogPost.author.name || 'Unknown Author';
    }
    return 'Unknown Author';
  };


  const getPublishDate = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'Not specified';
    

    const metadataPublishDate = (blogPost as any)?.metadata?.publishDate;
    const timestampsPublished = (blogPost as any)?.timestamps?.published;
    const timestampsCreated = (blogPost as any)?.timestamps?.created;
    
    const publishDate = metadataPublishDate || 
                      timestampsPublished || 
                      timestampsCreated ||
                      (blogPost as any)?.published || 
                      (blogPost as any)?.publishDate || 
                      blogPost.publishedDate || 
                      blogPost.createdAt;
    
    if (!publishDate) return 'Not specified';
    try {
      return formatDate(publishDate);
    } catch (error) {
      console.error('Date formatting error:', error, 'Raw date:', publishDate);
      return publishDate || 'Not specified';
    }
  };


  const getCategoryName = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'No Category';
    
    const metadataCategories = (blogPost as any)?.metadata?.categories;
    if (metadataCategories && Array.isArray(metadataCategories) && metadataCategories.length > 0) {
      const firstCategory = metadataCategories[0];
      return firstCategory?.name || 'Uncategorized';
    }
    
    if (blogPost.category) {
      if (typeof blogPost.category === 'string') {
        return blogPost.category;
      } else if (blogPost.category && typeof blogPost.category === 'object') {
        return blogPost.category.name || 'Uncategorized';
      }
    }
 
    const categories = (blogPost as any)?.categories;
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const firstCategory = categories[0];
      return typeof firstCategory === 'string' ? firstCategory : (firstCategory?.name || 'Uncategorized');
    }
    return 'No Category';
  };

  const getStatus = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'Not specified';
    
    const status = (blogPost as any)?.metadata?.status || blogPost.status;
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Not specified';
  };

  const getSEOTitle = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'Blog Post | Gotham Enterprises';
    
    const seoTitle = (blogPost as any)?.seo?.title;
    if (seoTitle && seoTitle.trim()) {
      return `${seoTitle} | Gotham Enterprises`;
    }
    
    return `${blogPost.title} | Gotham Enterprises`;
  };

  const getSEODescription = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'Read our latest blog post on Gotham Enterprises.';
    
    const seoDescription = (blogPost as any)?.seo?.description;
    if (seoDescription && seoDescription.trim()) {
      return seoDescription;
    }
    
    if (blogPost.excerpt && blogPost.excerpt.trim()) {
      return blogPost.excerpt;
    }
    
    return `Read about ${blogPost.title} on Gotham Enterprises blog.`;
  };

  const getSEOKeywords = (blogPost: BlogPost | null): string => {
    if (!blogPost) return 'blog, gotham enterprises';
    
    const seoKeywords = (blogPost as any)?.seo?.keywords;
    if (seoKeywords && Array.isArray(seoKeywords) && seoKeywords.length > 0) {
      return seoKeywords.join(', ');
    }

    const tags = blogPost.tags;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagNames = tags.map((tag: any) => 
        typeof tag === 'string' ? tag : (tag?.name || '')
      ).filter(Boolean);
      
      if (tagNames.length > 0) {
        return `${tagNames.join(', ')}, blog, gotham enterprises`;
      }
    }
    
    return `${blogPost.title}, blog, gotham enterprises`;
  };


  const getBlogImage = (blogPost: BlogPost | null): string => {
    if (!blogPost) return SITE_CONFIG.DEFAULT_SHARE_IMAGE;

    const image = blogPost.featuredImage || 
                 (blogPost as any)?.image || 
                 (blogPost as any)?.metadata?.image ||
                 (blogPost as any)?.thumbnail;
    
    if (image) {
      if (typeof image === 'string') {
        return image;
      } else if (typeof image === 'object' && image.url) {
        return image.url;
      }
    }
    
    return SITE_CONFIG.DEFAULT_SHARE_IMAGE;
  };

  const getCurrentBlogUrl = (blogPost: BlogPost | null): string => {
    if (!blogPost) return '';
    
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    
    const slug = processSlug(blogPost.slug || blogPost.title);
    return generateBlogUrl(slug);
  };

  const getImageDimensions = (blogPost: BlogPost | null): { width: string; height: string } => {
    if (!blogPost) return { width: '1200', height: '630' };
    
    const image = blogPost.featuredImage || 
                 (blogPost as any)?.image || 
                 (blogPost as any)?.metadata?.image ||
                 (blogPost as any)?.thumbnail;
    
    if (image && typeof image === 'object') {
      return {
        width: image.width?.toString() || '1200',
        height: image.height?.toString() || '630'
      };
    }

    return { width: '1200', height: '630' };
  };

  const getSiteName = (): string => {
    return 'Gotham Enterprises Blog';
  };

  const renderTags = (blogPost: BlogPost | null) => {
    if (!blogPost) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          No Tags
        </span>
      );
    }

    const metadataTags = (blogPost as any)?.metadata?.tags;
    if (metadataTags && Array.isArray(metadataTags) && metadataTags.length > 0) {
      return metadataTags.map((tag: any, index: number) => {
        const tagName = tag?.name || `Tag ${index + 1}`;
        const tagKey = tag?.id || tag?.name || index;
        
        return (
          <span
            key={tagKey}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            {tagName}
          </span>
        );
      });
    }
    
    if (blogPost.tags && Array.isArray(blogPost.tags) && blogPost.tags.length > 0) {
      return blogPost.tags.map((tag: any, index: number) => {
        const tagName = typeof tag === 'string' ? tag : (tag?.name || `Tag ${index + 1}`);
        const tagKey = tag?.id || tag?.name || index;
        
        return (
          <span
            key={tagKey}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            {tagName}
          </span>
        );
      });
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          No Tags
        </span>
      );
    }
  };

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        let blogData;
        
        if (blogSlug) {
          blogData = await blogApi.getBlogPostBySlug(blogSlug);
        } else if (blogId) {
          blogData = await blogApi.getBlogPostById(blogId);
        } else {
          throw new Error('Either blogId or blogSlug must be provided');
        }
        
        setBlogPost(blogData);
      } catch (err: any) {
        console.error('Error fetching blog post:', err); 
        setError(err.message || 'Failed to fetch blog post');
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId || blogSlug) {
      fetchBlogPost();
    }
  }, [blogId, blogSlug]);


  useEffect(() => {
    if (blogPost) {
    
      document.title = getSEOTitle(blogPost);
  
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', getSEODescription(blogPost));
      } else {
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.name = 'description';
        newMetaDescription.content = getSEODescription(blogPost);
        document.head.appendChild(newMetaDescription);
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', getSEOKeywords(blogPost));
      } else {
        const newMetaKeywords = document.createElement('meta');
        newMetaKeywords.name = 'keywords';
        newMetaKeywords.content = getSEOKeywords(blogPost);
        document.head.appendChild(newMetaKeywords);
      }
    }
  }, [blogPost]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
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
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{getSEOTitle(blogPost)}</title>
        <meta name="description" content={getSEODescription(blogPost)} />
        <meta name="keywords" content={getSEOKeywords(blogPost)} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content={blogPost?.title || 'Blog Post'} />
        <meta property="og:description" content={getSEODescription(blogPost)} />
        <meta property="og:image" content={getBlogImage(blogPost)} />
        <meta property="og:image:width" content={getImageDimensions(blogPost).width} />
        <meta property="og:image:height" content={getImageDimensions(blogPost).height} />
        <meta property="og:url" content={getCurrentBlogUrl(blogPost)} />
        <meta property="og:site_name" content={getSiteName()} />
        <meta property="og:type" content="article" />
        
        {(() => {
          const ogData = getOpenGraphData();
          if (!ogData) return null;
          
          return generateOpenGraphTags(ogData).map((tag, index) => (
            <meta key={index} property={tag.property} content={tag.content} />
          ));
        })()}
   
        {(() => {
          const ogData = getOpenGraphData();
          if (!ogData) return null;
          
          return generateTwitterCardTags(ogData).map((tag, index) => (
            <meta key={index} name={tag.name} content={tag.content} />
          ));
        })()}
        
        <meta name="author" content={getAuthorName(blogPost)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {(() => {
          const ogData = getOpenGraphData();
          if (!ogData) return null;
          
          return <link rel="canonical" href={ogData.url} />;
        })()}
        {(() => {
          const ogData = getOpenGraphData();
          if (!ogData) return null;
          
          const structuredData = generateStructuredData(ogData);
          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData, null, 2)
              }}
            />
          );
        })()}
      </Head>
      
      {blogPost && typeof window !== 'undefined' && (
        <SocialShare 
          url={`${window.location.origin}${window.location.pathname}`}
          title={blogPost.title}
          description={getSEODescription(blogPost)}
        />
      )}
      
      <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="overflow-hidden">

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
                ((blogPost as any)?.metadata?.status || blogPost.status) === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : ((blogPost as any)?.metadata?.status || blogPost.status) === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatus(blogPost)}
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
              {((blogPost as any)?.metadata?.author || blogPost.author) && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="mr-2" />
                  <span>By {getAuthorName(blogPost)}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <CalenderIcon className="mr-2" />
                <span>Published {getPublishDate(blogPost)}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getCategoryName(blogPost)}
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {renderTags(blogPost)}
              </div>
            </div>
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
      </main>
    </div>
    </>
  );
};

export default BlogPreview;