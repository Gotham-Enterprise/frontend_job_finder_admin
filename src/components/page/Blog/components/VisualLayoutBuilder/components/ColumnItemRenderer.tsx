import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import { VideoIcon, FileIcon, DocsIcon } from '../../../../../../icons';

interface ColumnItemRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onContentUpdate?: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
  columnIndex?: number;
  onOpenSettings?: (type: 'image' | 'video' | 'paragraph', block: LayoutBlock) => void;
}

const ColumnItemRenderer: React.FC<ColumnItemRendererProps> = ({
  block,
  isSelected,
  onClick,
  onRemove,
  onContentUpdate,
  onStyleUpdate,
  columnIndex = 0,
  onOpenSettings
}) => {
  const contentBlock = block.content as LayoutBlock;

  const openContentSettings = () => {
    if (onOpenSettings && contentBlock.type) {
      onOpenSettings(contentBlock.type as 'image' | 'video' | 'paragraph', contentBlock);
    }
  };

  const updateContentField = (field: string, value: any) => {
    const updatedContent = { ...contentBlock, [field]: value };
    onContentUpdate?.('content', updatedContent);
  };

  const CONTENT_RENDERERS = {
    paragraph: () => renderTextContent(),
    image: () => renderImageContent(), 
    video: () => renderVideoContent()
  };

  const renderContent = () => {
    if (!contentBlock?.type) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 min-h-[120px] flex flex-col items-center justify-center">
          <div className="text-gray-500 text-sm">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p>Empty Column</p>
            <p className="text-xs mt-1">Configure in Column Settings</p>
          </div>
        </div>
      );
    }

    const renderer = CONTENT_RENDERERS[contentBlock.type as keyof typeof CONTENT_RENDERERS];
    return renderer ? renderer() : (
      <div className="text-center text-gray-500 py-8">
        <p>Unknown content type</p>
      </div>
    );
  };

  const renderTextContent = () => {
    const text = contentBlock.content?.text || 'Click to edit text';
    const styles = {
      fontSize: contentBlock.styles?.fontSize || '1rem',
      fontWeight: contentBlock.styles?.fontWeight || 'normal',
      color: contentBlock.styles?.textColor || '#000000',
      textAlign: contentBlock.styles?.textAlign || 'left',
      fontFamily: contentBlock.styles?.fontFamily || 'inherit',
      lineHeight: contentBlock.styles?.lineHeight || '1.6',
    } as React.CSSProperties;

    return (
      <div className="p-3">
        <p 
          style={styles}
          className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[40px] flex items-center"
          onClick={openContentSettings}
        >
          {text}
        </p>
      </div>
    );
  };

  const renderImageContent = () => {
    const { url: imageUrl, alt: altText = 'Column image' } = contentBlock.content || {};
    const { width = 100, height = 200, widthUnit = '%', heightUnit = 'px' } = contentBlock.styles || {};

    const placeholderContent = (
      <div className="text-center text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs">Add Image</p>
      </div>
    );

    return (
      <div className="p-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            style={{
              width: `${width}${widthUnit}`,
              height: `${height}${heightUnit}`,
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={openContentSettings}
          />
        ) : (
          <div 
            className="bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            style={{ width: `${width}${widthUnit}`, height: `${height}${heightUnit}` }}
            onClick={openContentSettings}
          >
            {placeholderContent}
          </div>
        )}
      </div>
    );
  };

  const renderVideoContent = () => {
    const { url: videoUrl, title: videoTitle = 'Column video' } = contentBlock.content || {};
    const { width = 100, height = 200, widthUnit = '%', heightUnit = 'px' } = contentBlock.styles || {};

    const getVideoEmbedUrl = (url: string) => {
      if (!url) return '';
      
      const providers = {
        youtube: {
          patterns: ['youtube.com/watch?v=', 'youtu.be/', 'youtube.com/shorts/'],
          getId: (url: string) => {
            if (url.includes('youtube.com/watch?v=')) return url.split('v=')[1]?.split('&')[0];
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
            if (url.includes('youtube.com/shorts/')) return url.split('/shorts/')[1]?.split('?')[0];
            return '';
          },
          embed: (id: string) => `https://www.youtube.com/embed/${id}`
        },
        vimeo: {
          patterns: ['vimeo.com/'],
          getId: (url: string) => url.split('vimeo.com/')[1]?.split('?')[0],
          embed: (id: string) => `https://player.vimeo.com/video/${id}`
        }
      };

      for (const provider of Object.values(providers)) {
        if (provider.patterns.some(pattern => url.includes(pattern))) {
          const videoId = provider.getId(url);
          return videoId ? provider.embed(videoId) : url;
        }
      }
      return url;
    };

    const placeholderContent = (
      <div className="text-center text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs">Add Video</p>
      </div>
    );

    return (
      <div className="p-2">
        {videoUrl ? (
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={openContentSettings}
          >
            <iframe
              src={getVideoEmbedUrl(videoUrl)}
              title={videoTitle}
              style={{
                width: `${width}${widthUnit}`,
                height: `${height}${heightUnit}`,
                borderRadius: '8px'
              }}
              className="border-0"
              allowFullScreen
            />
          </div>
        ) : (
          <div 
            className="bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            style={{ width: `${width}${widthUnit}`, height: `${height}${heightUnit}` }}
            onClick={openContentSettings}
          >
            {placeholderContent}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative group">
      {renderContent()}
      {isSelected && onRemove && (
        <div className="absolute top-2 right-2">
          <button
            onClick={onRemove}
            className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ColumnItemRenderer;
