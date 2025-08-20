import React, { useState, useEffect, useRef } from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import { getButtonDefaultStyles, getSizeStyles } from '../utils/buttonUtils';
import RichTextEditor from './RichTextEditor';

interface BlockRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onContentUpdate?: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
  onOpenSettings?: (type: 'image' | 'video' | 'paragraph' | 'button' | 'list' | 'quote', block: LayoutBlock) => void;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingTag = typeof HEADING_TAGS[number];

const DEFAULT_STYLES = {
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
    lineHeight: '1.3',
  },
  paragraph: {
    fontSize: '1rem',
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  image: {
    borderRadius: '8px',
    height: '192px',
  },
};

const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, 
  isSelected, 
  onClick, 
  onRemove, 
  onContentUpdate, 
  onStyleUpdate,
  onOpenSettings
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, [isEditing, editValue]);

  const createStyle = (type: 'heading' | 'paragraph') => ({
    fontSize: block.styles.fontSize || DEFAULT_STYLES[type].fontSize,
    fontWeight: block.styles.fontWeight || DEFAULT_STYLES[type].fontWeight,
    fontStyle: block.styles.fontStyle || 'normal',
    textDecoration: block.styles.textDecoration || 'none',
    color: block.styles.textColor || DEFAULT_STYLES[type].color,
    textAlign: block.styles.textAlign || DEFAULT_STYLES[type].textAlign,
    fontFamily: block.styles.fontFamily || DEFAULT_STYLES[type].fontFamily,
    letterSpacing: block.styles.letterSpacing || '0px',
    lineHeight: block.styles.lineHeight || DEFAULT_STYLES[type].lineHeight,
  } as React.CSSProperties);

  const startEditing = (currentText: string) => {
    const isHeadingPlaceholder = currentText === 'Your Heading Here';
    const isParagraphPlaceholder = currentText === 'Start writing your content here...';
    
    if (isHeadingPlaceholder || isParagraphPlaceholder) {
      setEditValue('');
    } else {
      setEditValue(currentText || '');
    }
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (onContentUpdate) {
      onContentUpdate('text', editValue);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const preventClickPropagation = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.stopPropagation();
    }
  };

  const renderEditableHeading = () => {
    const level = (block.content as any)?.level || 1; 
    const text = (block.content as any)?.text || 'Your Heading Here';
    const url = (block.content as any)?.url;
    const style = createStyle('heading');
    const Tag = HEADING_TAGS[Math.min(Math.max(level - 1, 0), 5)] as HeadingTag;
    
    const displayText = text === 'Your Heading Here' ? 'Your Heading Here' : text;
    const isPlaceholder = text === 'Your Heading Here';
    
    const linkColor = block.styles?.linkColor || '#3b82f6';
    const styledText = text.replace(
      /<a\s+(?![^>]*style\s*=\s*["'][^"']*color\s*:)[^>]*>/gi,
      `<a style="color: ${linkColor};" $&`.slice(0, -2) + '>'
    ).replace(
      /(<a\s+[^>]*style\s*=\s*["'])([^"']*)(["'][^>]*>)/gi,
      (match: string, start: string, styleContent: string, end: string) => {
        if (!styleContent.includes('color:')) {
          const separator = styleContent.trim() && !styleContent.trim().endsWith(';') ? '; ' : '';
          return `${start}${styleContent}${separator}color: ${linkColor}${end}`;
        }
        return match;
      }
    );

    if (isEditing) {
      return (
        <div>
          <RichTextEditor
            key={`heading-${block.id || 'default'}-${isEditing}`}
            value={editValue}
            onChange={setEditValue}
            onBlur={saveEdit}
            onCancel={cancelEdit}
            style={{
              ...style,
              minHeight: '1.2em',
              overflow: 'visible',
            }}
            className="w-full bg-transparent border-none outline-none"
            isMultiline={false}
            placeholder="Your Heading Here"
          />
        </div>
      );
    }

    if (isPlaceholder) {
      return (
        <div className="prose prose-sm max-w-none">
          <Tag 
            style={{
              ...style,
              color: '#9ca3af',
              fontStyle: 'italic',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            onClick={(e) => {
              e.stopPropagation();
              startEditing(text);
            }}
          >
            {displayText}
          </Tag>
        </div>
      );
    }

    if (url && url.trim()) {
      return (
        <div className="prose prose-sm max-w-none">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tag 
              style={{
                ...style,
                color: linkColor,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startEditing(text);
              }}
            >
              {styledText.includes('<a ') ? (
                <span dangerouslySetInnerHTML={{ __html: styledText }} />
              ) : (
                styledText
              )}
            </Tag>
          </a>
        </div>
      );
    }

    if (styledText.includes('<a ')) {
      return (
        <div className="prose prose-sm max-w-none">
          <Tag 
            style={{
              ...style,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: styledText }}
            onClick={(e) => {
              // Double-click to edit, single click to select block
              if (e.detail === 2) {
                e.stopPropagation();
                startEditing(text);
              } else {
                // Allow single click to bubble up for block selection
                onClick?.();
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <Tag 
          style={{
            ...style,
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
          onClick={(e) => {
            // Double-click to edit, single click to select block
            if (e.detail === 2) {
              e.stopPropagation();
              startEditing(text);
            } else {
              // Allow single click to bubble up for block selection
              onClick?.();
            }
          }}
        >
          {text}
        </Tag>
      </div>
    );
  };

  const renderEditableParagraph = () => {
    const text = (block.content as any)?.text || 'Start writing your content here...';
    const style = createStyle('paragraph');
    
   
    const displayText = text === 'Start writing your content here...' ? 'Start writing your content here...' : text;
    const isPlaceholder = text === 'Start writing your content here...';

    if (isEditing) {
      return (
        <RichTextEditor
          key={`paragraph-${block.id || 'default'}-${isEditing}`}
          value={editValue}
          onChange={setEditValue}
          onBlur={saveEdit}
          onCancel={cancelEdit}
          style={{
            ...style,
            minHeight: '80px',
            resize: 'none',
            overflow: 'hidden',
          }}
          className="w-full bg-transparent border-none outline-none resize-none"
          isMultiline={true}
          placeholder="Start writing your content here..."
        />
      );
    }

  
    if (isPlaceholder) {
      return (
        <div 
          className="prose prose-lg max-w-none"
          style={{
            ...style,
            color: '#9ca3af',
            fontStyle: 'italic',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
          onClick={(e) => {
            // Double-click to edit, single click to select block
            if (e.detail === 2) {
              e.stopPropagation();
              startEditing(text);
            } else {
              // Allow single click to bubble up for block selection
              onClick?.();
            }
          }}
        >
          <p>{displayText}</p>
        </div>
      );
    }

    if (text.includes('<') && text.includes('>')) {
    
      const linkColor = block.styles.linkColor || '#3b82f6';
      const styledText = text.replace(
        /<a\s+([^>]*)>/g,
        `<a $1 style="color: ${linkColor}; text-decoration: underline;">`
      );
      
      return (
        <div 
          className="prose prose-lg max-w-none"
          style={{
            ...style,
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
          onClick={(e) => {
            
            if ((e.target as HTMLElement).tagName === 'A') {
              e.stopPropagation();
              return; 
            }
            if (e.detail === 2) {
              e.stopPropagation();
              startEditing(text);
            } else {
              onClick?.();
            }
          }}
        >
          <style>
            {`
              .prose p {
                margin-bottom: 1rem;
                line-height: 1.75;
              }
              .prose strong {
                font-weight: 600;
              }
              .prose em {
                font-style: italic;
              }
              .prose a {
                color: ${linkColor};
                text-decoration: underline;
              }
              .prose a:hover {
                opacity: 0.8;
              }
              .prose h1, .prose h2, .prose h3 {
                margin-bottom: 1rem;
                font-weight: bold;
              }
              .prose h1 {
                font-size: 2rem;
                line-height: 1.25;
              }
              .prose h2 {
                font-size: 1.5rem;
                line-height: 1.3;
              }
              .prose h3 {
                font-size: 1.25rem;
                line-height: 1.4;
              }
              .prose ul, .prose ol {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .prose li {
                margin-bottom: 0.25rem;
              }
            `}
          </style>
          <div dangerouslySetInnerHTML={{ __html: styledText }} />
        </div>
      );
    }

    return (
      <div 
        className="prose prose-lg max-w-none"
        style={{
          ...style,
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
        onClick={(e) => {
          e.stopPropagation();
          startEditing(text);
        }}
      >
        <style>
          {`
            .prose p {
              margin-bottom: 1rem;
              line-height: 1.75;
            }
            .prose strong {
              font-weight: 600;
            }
            .prose em {
              font-style: italic;
            }
          `}
        </style>
        <p>{text}</p>
      </div>
    );
  };

  const renderImage = () => {
    const imageUrl = (block.content as any)?.url;
    const altText = (block.content as any)?.alt || 'Image';
    const imageWidth = block.styles.width || 100;
    const imageHeight = block.styles.height !== undefined ? block.styles.height : 400;
    const widthUnit = block.styles.widthUnit || '%';
    const heightUnit = block.styles.heightUnit || 'px';
    const imageAlign = block.styles.imageAlign || 'center';
    const borderRadius = block.styles.border?.radius || 8;
    
    const getAlignmentClass = () => {
      switch (imageAlign) {
        case 'left': return 'mr-auto';
        case 'right': return 'ml-auto';
        case 'center': 
        default: return 'mx-auto';
      }
    };
    
    const imageStyle = {
      width: `${imageWidth}${widthUnit}`,
      height: `${imageHeight}${heightUnit}`,
      borderRadius: `${borderRadius}px`,
      objectFit: 'cover' as const,
      display: 'block',
    };

    if (!imageUrl) {
      return (
        <div 
          className={`bg-gray-200 rounded flex items-center justify-center ${getAlignmentClass()}`}
          style={{ 
            width: `${imageWidth}${widthUnit}`, 
            height: `${imageHeight}${heightUnit}`,
            borderRadius: `${borderRadius}px`,
            display: 'block'
          }}
        >
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <img 
          src={imageUrl} 
          alt={altText}
          style={imageStyle}
          className={`border border-gray-200 ${getAlignmentClass()}`}
        />
      </div>
    );
  };

  const renderVideo = () => {
    const videoUrl = (block.content as any)?.url;
    const videoTitle = (block.content as any)?.title || 'Video';
    const videoWidth = block.styles.width || 100;
    const videoHeight = block.styles.height !== undefined ? block.styles.height : 400;
    const widthUnit = block.styles.widthUnit || '%';
    const heightUnit = block.styles.heightUnit || 'px';
    const videoAlign = block.styles.videoAlign || 'center';
    const borderRadius = block.styles.border?.radius || 8;
    const autoplay = (block.content as any)?.autoplay || false;
    const controls = (block.content as any)?.controls !== false;
    const muted = (block.content as any)?.muted || false;
    
    const VIDEO_PROVIDERS = {
      youtube: {
        patterns: ['youtube.com/watch?v=', 'youtu.be/', 'youtube.com/shorts/'],
        getVideoId: (url: string) => {
          if (url.includes('youtube.com/watch?v=')) return url.split('v=')[1]?.split('&')[0];
          if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
          if (url.includes('youtube.com/shorts/')) return url.split('/shorts/')[1]?.split('?')[0];
          return '';
        },
        buildEmbedUrl: (videoId: string) => {
          const params = new URLSearchParams({
            rel: '0',
            ...(autoplay && { autoplay: '1' }),
            ...(muted && { mute: '1' })
          });
          return `https://www.youtube.com/embed/${videoId}?${params}`;
        }
      },
      vimeo: {
        patterns: ['vimeo.com/'],
        getVideoId: (url: string) => url.split('vimeo.com/')[1]?.split('?')[0],
        buildEmbedUrl: (videoId: string) => {
          const params = new URLSearchParams({
            portrait: '0',
            byline: '0',
            title: '0',
            ...(autoplay && { autoplay: '1' }),
            ...(muted && { muted: '1' })
          });
          return `https://player.vimeo.com/video/${videoId}?${params}`;
        }
      }
    };

    const ALIGNMENT_CLASSES = {
      left: 'mr-auto',
      right: 'ml-auto',
      center: 'mx-auto'
    };

    const getAlignmentClass = () => ALIGNMENT_CLASSES[videoAlign] || ALIGNMENT_CLASSES.center;

    const getVideoEmbedUrl = (url: string) => {
      for (const [, provider] of Object.entries(VIDEO_PROVIDERS)) {
        if (provider.patterns.some(pattern => url.includes(pattern))) {
          const videoId = provider.getVideoId(url);
          return videoId ? provider.buildEmbedUrl(videoId) : url;
        }
      }
      return url;
    };
    
    const videoStyle = {
      width: `${videoWidth}${widthUnit}`,
      height: `${videoHeight}${heightUnit}`,
      borderRadius: `${borderRadius}px`,
      display: 'block',
    };

    if (!videoUrl) {
      return (
        <div 
          className={`bg-gray-200 rounded flex items-center justify-center ${getAlignmentClass()}`}
          style={{ 
            width: `${videoWidth}${widthUnit}`, 
            height: `${videoHeight}${heightUnit}`,
            borderRadius: `${borderRadius}px`,
            display: 'block'
          }}
        >
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Video</p>
          </div>
        </div>
      );
    }

    const embedUrl = getVideoEmbedUrl(videoUrl);
    const isEmbedUrl = embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com');

    if (isEmbedUrl) {
      return (
        <div className="w-full">
          <iframe
            src={embedUrl}
            title={videoTitle}
            style={videoStyle}
            className={`border border-gray-200 ${getAlignmentClass()}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full">
        <video
          src={videoUrl}
          title={videoTitle}
          style={videoStyle}
          className={`border border-gray-200 ${getAlignmentClass()}`}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
        />
      </div>
    );
  };

  const renderButton = () => {
    const buttonText = (block.content as any)?.text || 'Click Me';
    const buttonUrl = (block.content as any)?.url;
    const buttonTarget = (block.content as any)?.target || '_self';
    const variant = (block.content as any)?.variant || 'primary';
    const size = (block.content as any)?.size || 'medium';
    const width = (block.content as any)?.width || 'auto';
    const customWidth = (block.content as any)?.customWidth || 200;
    const alignment = (block.content as any)?.alignment || 'left';
    
    const variantStyles = getButtonDefaultStyles(variant) as any;
    const sizeStyles = getSizeStyles(size);
    
    const buttonStyle = {
      backgroundColor: block.styles?.backgroundColor || variantStyles.backgroundColor,
      color: block.styles?.textColor || variantStyles.textColor,
      fontSize: block.styles?.fontSize || sizeStyles.fontSize,
      fontWeight: block.styles?.fontWeight || variantStyles.fontWeight,
      textAlign: block.styles?.textAlign || variantStyles.textAlign,
      fontFamily: block.styles?.fontFamily || 'inherit',
      border: block.styles?.border?.width 
        ? `${block.styles.border.width}px ${block.styles.border.style || 'solid'} ${block.styles.border.color || 'transparent'}`
        : variantStyles.border?.width 
        ? `${variantStyles.border.width}px ${variantStyles.border.style || 'solid'} ${variantStyles.border.color || 'transparent'}`
        : 'none',
      borderRadius: block.styles?.border?.radius ? `${block.styles.border.radius}px` : `${variantStyles.border?.radius || 6}px`,
      padding: block.styles?.padding 
        ? `${block.styles.padding.top || 12}px ${block.styles.padding.right || 24}px ${block.styles.padding.bottom || 12}px ${block.styles.padding.left || 24}px`
        : `${sizeStyles.padding.top}px ${sizeStyles.padding.right}px ${sizeStyles.padding.bottom}px ${sizeStyles.padding.left}px`,
      cursor: 'pointer',
      display: 'inline-block',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      width: width === 'full' ? '100%' : width === 'custom' ? `${customWidth}px` : 'auto',
    } as React.CSSProperties;

    const containerClass = `flex w-full ${
      alignment === 'center' ? 'justify-center' : 
      alignment === 'right' ? 'justify-end' : 
      'justify-start'
    }`;

    // Settings button for when block is selected (editor mode)
    const SettingsButton = () => (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onOpenSettings) {
            onOpenSettings('button' as any, block);
          }
        }}
        className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ zIndex: 1000 }}
      >
        Edit Button
      </button>
    );

    if (buttonUrl && buttonUrl.trim()) {
      return (
        <div className={`${containerClass} relative group`}>
          {isSelected && <SettingsButton />}
          <a
            href={buttonUrl}
            target={buttonTarget}
            rel={buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
            style={buttonStyle}
            className={`btn btn-${variant} btn-${size} hover:opacity-90 transition-opacity`}
            onClick={(e) => {
              // In preview mode, allow normal button functionality
              if (isSelected) {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenSettings) {
                  onOpenSettings('button' as any, block);
                }
              } else {
                // Let the link work normally in preview
                e.stopPropagation();
              }
            }}
          >
            {buttonText}
          </a>
        </div>
      );
    }

    return (
      <div className={`${containerClass} relative group`}>
        {isSelected && <SettingsButton />}
        <button
          type="button"
          style={buttonStyle}
          className={`btn btn-${variant} btn-${size} hover:opacity-90 transition-opacity`}
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected && onOpenSettings) {
              onOpenSettings('button' as any, block);
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    );
  };

  const renderList = () => {
    const items = (block.content as any)?.items || [];
    const isOrdered = (block.content as any)?.ordered || false;
    const style = createStyle('paragraph');
    
    if (items.length === 0) {
      return (
        <div 
          className="bg-gray-100 rounded-lg p-6 text-center"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings?.('list', block);
          }}
        >
          <div className="text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-sm">Click to add list items</p>
          </div>
        </div>
      );
    }

    const ListTag = isOrdered ? 'ol' : 'ul';
    const linkColor = block.styles?.linkColor || '#3b82f6';
    
    return (
      <div>
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
        <ListTag 
          style={{
            ...style,
            listStyleType: isOrdered ? 'decimal' : 'disc',
            paddingLeft: '1.5rem',
            margin: '0.5rem 0',
          }}
          className={`space-y-1 list-${block.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings?.('list', block);
          }}
        >
          {items.map((item: string, index: number) => (
            <li 
              key={index} 
              style={{ margin: '0.25rem 0' }}
              dangerouslySetInnerHTML={{ 
                __html: item || `Item ${index + 1}` 
              }}
            />
          ))}
        </ListTag>
      </div>
    );
  };

  const renderQuote = () => {
    const text = (block.content as any)?.text || 'Do you have a design in mind for your blog? Whether you prefer a trendy postcard look or you\'re going for a more editorial style blog - there\'s a stunning layout for everyone.';
    const author = (block.content as any)?.author || '';
    const citation = (block.content as any)?.citation || '';
    const style = createStyle('paragraph');
    
    return (
      <blockquote 
        style={{
          ...style,
          borderLeft: `4px solid ${block.styles?.accentColor || '#8b5cf6'}`,
          paddingLeft: '1.5rem',
          margin: '1rem 0',
          fontStyle: 'italic',
          backgroundColor: block.styles?.backgroundColor || '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
        }}
        className="relative"
        onClick={(e) => {
          e.stopPropagation();
          onOpenSettings?.('quote', block);
        }}
      >
        <div className="text-lg leading-relaxed mb-3" style={{ color: style.color || '#374151' }}>
          &ldquo;{text}&rdquo;
        </div>
        {(author || citation) && (
          <footer className="text-sm mt-4 pt-3 border-t border-gray-200" style={{ color: '#6b7280' }}>
            {author && <cite className="font-medium not-italic">— {author}</cite>}
            {author && citation && <span className="mx-2">•</span>}
            {citation && <span className="italic">{citation}</span>}
          </footer>
        )}
      </blockquote>
    );
  };

  const BLOCK_RENDERERS = {
    heading: renderEditableHeading,
    paragraph: renderEditableParagraph,
    image: renderImage,
    video: renderVideo,
    list: renderList,
    quote: renderQuote,
    button: renderButton,
  };

  const renderBlockContent = () => {
    const renderer = BLOCK_RENDERERS[block.type as keyof typeof BLOCK_RENDERERS];
    return renderer ? renderer() : <div className="text-gray-500">Unknown block type: {block.type}</div>;
  };

  const createBorderStyle = () => {
    const border = block.styles.border;
    if (!border?.width) return {};
    
    return {
      border: `${border.width}px ${border.style || 'solid'} ${border.color || '#000000'}`,
      borderRadius: border.radius ? `${border.radius}px` : undefined,
    };
  };

  const createContainerStyle = () => {
    const margin = block.styles.margin;
    const padding = block.styles.padding;
    const hasCustomBorder = block.styles.border?.width;
    
    const defaultMargin = (block.type === 'image' || block.type === 'video') ? { top: 16, right: 0, bottom: 16, left: 0 } : { top: 8, right: 0, bottom: 8, left: 0 };
    const actualMargin = margin || defaultMargin;
    
   
    const adjustedPadding = padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const minTopPadding = Math.max(adjustedPadding.top || 0, 15); 
    const minRightPadding = Math.max(adjustedPadding.right || 0, 8); 
    
    const containerBackgroundColor = block.type === 'button' ? 'transparent' : (block.styles.backgroundColor || 'transparent');
    
    return {
      margin: `${actualMargin.top || 0}px ${actualMargin.right || 0}px ${actualMargin.bottom || 0}px ${actualMargin.left || 0}px`,
      padding: `${minTopPadding}px ${minRightPadding}px ${adjustedPadding.bottom || 0}px ${adjustedPadding.left || 0}px`,
      backgroundColor: containerBackgroundColor,
      minHeight: '40px',
      overflow: 'visible',
      position: 'relative' as const,
      width: '100%',
      border: isSelected 
        ? '2px solid #a855f7' 
        : 'transparent',
      borderRadius: hasCustomBorder && block.styles.border?.radius 
        ? `${block.styles.border.radius}px` 
        : '8px',
      ...createBorderStyle(),
    };
  };

  return (
    <div 
      onClick={(e) => {

        e.stopPropagation();
        onClick?.();
      }}
      className={`relative group cursor-pointer transition-all duration-200 block clear-both ${
        isSelected ? 'shadow-lg ring-2 ring-purple-200' : 'hover:border-gray-300'
      }`}
      style={createContainerStyle()}
    >
      <div className={`absolute top-2 left-2 transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
      }`}>
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
          {block.type}
        </span>
      </div>
      
      <div className={`absolute top-2 right-2 transition-opacity duration-200 z-20 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.();
          }}
          className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors pointer-events-auto"
          title="Delete block"
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {renderBlockContent()}
    </div>
  );
};

export default BlockRenderer;
