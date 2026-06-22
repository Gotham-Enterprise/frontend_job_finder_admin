import { getAdBlockType, getAdLinkTextCss, AD_MEDIA_LINK_CLASS, getAdMediaLinkHoverCss } from '@/services/types/visualLayoutTypes';

interface BlogPost {
  title: string;
  permalink: string;
  content: string | { blocks: any[]; version: string } | any;
  excerpt: string;
  publishDate: string;
  categories: string[];
  tags: string[];
}

interface CategoryOption {
  value: string;
  text: string;
  selected: boolean;
}

interface TagOption {
  value: string;
  text: string;
  selected: boolean;
}

export const openBlogPreview = (
  blogPost: BlogPost, 
  categoryOptions: CategoryOption[] = [], 
  tagOptions: TagOption[] = []
) => {
  
  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categoryOptions.find(option => option.value === id)?.text)
      .filter(Boolean);
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds
      .map(id => tagOptions.find(option => option.value === id)?.text)
      .filter(Boolean);
  };

  // Process content based on its type
  const processContent = (content: any) => {
    console.log('Processing content in blogPreview:', content);
    
    // If content is an object with blocks (like your payload structure)
    if (content && typeof content === 'object' && content.blocks) {
      console.log('Found blocks in content:', content.blocks);
      return renderBlocks(content.blocks);
    }
    // If content is already a string (HTML), use it directly
    if (typeof content === 'string') {
      console.log('Content is already string HTML');
      return content;
    }
    // Fallback for other cases
    console.log('Using fallback content');
    return '<p class="text-gray-500 italic">No content yet...</p>';
  };

  // Helper function to render text that might contain HTML
  const renderTextContent = (text: string) => {
    if (!text) return '';

    // Check if text contains HTML tags or HTML entities
    const hasHTMLTags = /<[^>]*>/g.test(text);
    const hasHTMLEntities = /&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9a-fA-F]+;/g.test(text);

    if (hasHTMLTags || hasHTMLEntities) {
      return text; // Return as-is for HTML content
    }

    return text;
  };

  // Main function to render blocks (similar to EditorJS renderer)
  const renderBlocks = (blocks: any[]) => {
    console.log('renderBlocks called with:', blocks);
    
    return blocks.map((block, index) => {
      const blockContent = block.content || block.data || {};
      console.log(`Rendering block ${index}:`, block.type, 'with content:', blockContent);
      
      switch (block.type) {
        case 'paragraph':
          const paragraphStyles = block.styles || {};
          const uniqueId = `paragraph-${index}-${Date.now()}`;

          const cssStyles = `
            .${uniqueId} {
              font-size: ${paragraphStyles.fontSize || '1rem'} !important;
              text-align: ${paragraphStyles.textAlign || 'left'} !important;
              font-weight: ${paragraphStyles.fontWeight || 'normal'} !important;
              font-style: ${paragraphStyles.fontStyle || 'normal'} !important;
              text-decoration: ${paragraphStyles.textDecoration || 'none'} !important;
              color: ${paragraphStyles.textColor || '#1f2937'} !important;
              background-color: ${paragraphStyles.backgroundColor || 'transparent'} !important;
              line-height: ${paragraphStyles.lineHeight || '1.6'} !important;
              letter-spacing: ${paragraphStyles.letterSpacing || 'normal'} !important;
              margin-top: ${paragraphStyles.margin?.top ? `${paragraphStyles.margin.top}px` : '0'} !important;
              margin-bottom: ${paragraphStyles.margin?.bottom ? `${paragraphStyles.margin.bottom}px` : '24px'} !important;
              margin-left: ${paragraphStyles.margin?.left ? `${paragraphStyles.margin.left}px` : '0'} !important;
              margin-right: ${paragraphStyles.margin?.right ? `${paragraphStyles.margin.right}px` : '0'} !important;
              padding-top: ${paragraphStyles.padding?.top ? `${paragraphStyles.padding.top}px` : '0'} !important;
              padding-bottom: ${paragraphStyles.padding?.bottom ? `${paragraphStyles.padding.bottom}px` : '0'} !important;
              padding-left: ${paragraphStyles.padding?.left ? `${paragraphStyles.padding.left}px` : '0'} !important;
              padding-right: ${paragraphStyles.padding?.right ? `${paragraphStyles.padding.right}px` : '0'} !important;
            }
          `;

          return `
            <style>${cssStyles}</style>
            <p class="${uniqueId}">${renderTextContent(blockContent.text || '')}</p>
          `;

        case 'heading':
        case 'header':
          const level = Math.min(Math.max(blockContent.level || 1, 1), 6);
          const headerUniqueId = `header-${index}-${Date.now()}`;
          const headerStyles = block.styles || {};

          const defaultHeaderStyles: Record<number, any> = {
            1: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '24px', marginTop: '24px' },
            2: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', marginTop: '20px' },
            3: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', marginTop: '16px' },
            4: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', marginTop: '12px' },
            5: { fontSize: '1rem', fontWeight: '600', marginBottom: '8px', marginTop: '8px' },
            6: { fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', marginTop: '8px' },
          };

          const defaultStyle = defaultHeaderStyles[level] || defaultHeaderStyles[1];

          const headerCssStyles = `
            .${headerUniqueId} {
              font-size: ${headerStyles.fontSize || defaultStyle.fontSize} !important;
              text-align: ${headerStyles.textAlign || 'left'} !important;
              font-weight: ${headerStyles.fontWeight || defaultStyle.fontWeight} !important;
              font-style: ${headerStyles.fontStyle || 'normal'} !important;
              text-decoration: ${headerStyles.textDecoration || 'none'} !important;
              color: ${headerStyles.textColor || '#1f2937'} !important;
              background-color: ${headerStyles.backgroundColor || 'transparent'} !important;
              line-height: ${headerStyles.lineHeight || '1.25'} !important;
              letter-spacing: ${headerStyles.letterSpacing || 'normal'} !important;
              margin-top: ${headerStyles.margin?.top ? `${headerStyles.margin.top}px` : defaultStyle.marginTop} !important;
              margin-bottom: ${headerStyles.margin?.bottom ? `${headerStyles.margin.bottom}px` : defaultStyle.marginBottom} !important;
              margin-left: ${headerStyles.margin?.left ? `${headerStyles.margin.left}px` : '0'} !important;
              margin-right: ${headerStyles.margin?.right ? `${headerStyles.margin.right}px` : '0'} !important;
              padding-top: ${headerStyles.padding?.top ? `${headerStyles.padding.top}px` : '0'} !important;
              padding-bottom: ${headerStyles.padding?.bottom ? `${headerStyles.padding.bottom}px` : '0'} !important;
              padding-left: ${headerStyles.padding?.left ? `${headerStyles.padding.left}px` : '0'} !important;
              padding-right: ${headerStyles.padding?.right ? `${headerStyles.padding.right}px` : '0'} !important;
            }
          `;

          return `
            <style>${headerCssStyles}</style>
            <h${level} class="${headerUniqueId}">${renderTextContent(blockContent.text || '')}</h${level}>
          `;

        case 'image':
          const imageUrl = blockContent.url || blockContent.file?.url || '';
          const imageAlt = blockContent.alt || blockContent.caption || 'Blog image';
          const imageCaption = blockContent.caption || '';
          const imageStyles = block.styles || {};
          const imageWidth = imageStyles.width || 100;
          const imageHeight = imageStyles.height || 400;
          const imageWidthUnit = imageStyles.widthUnit || '%';
          const imageHeightUnit = imageStyles.heightUnit || 'px';
          const imageAlign = imageStyles.imageAlign || 'center';
          const imageBorderRadius = imageStyles.border?.radius || 8;
          const imageBorderWidth = imageStyles.border?.width || 0;
          const imageBorderColor = imageStyles.border?.color || '#e5e7eb';

          const imageContainerAlignment = imageAlign === 'center' ? 'text-center' : imageAlign === 'right' ? 'text-right' : 'text-left';
          const imageUniqueId = `image-${index}-${Date.now()}`;
          const captionUniqueId = `caption-${index}-${Date.now()}`;

          const imageCssStyles = `
            .container-${imageUniqueId} {
              margin-bottom: 32px !important;
              text-align: ${imageAlign} !important;
            }
            .${imageUniqueId} {
              width: ${imageWidthUnit === '%' ? `${imageWidth}%` : `${imageWidth}px`} !important;
              height: ${imageHeightUnit === 'px' ? `${imageHeight}px` : 'auto'} !important;
              max-width: 100% !important;
              border-radius: ${imageBorderRadius}px !important;
              border: ${imageBorderWidth > 0 ? `${imageBorderWidth}px solid ${imageBorderColor}` : 'none'} !important;
              margin: ${imageAlign === 'center' ? '0 auto' : imageAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0'} !important;
              object-fit: cover !important;
              display: block !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            }
            .${captionUniqueId} {
              text-align: center !important;
              font-size: 0.875rem !important;
              color: #6b7280 !important;
              margin-top: 12px !important;
              font-style: italic !important;
            }
          `;

          return `
            <style>${imageCssStyles}</style>
            <div class="container-${imageUniqueId}">
              <figure style="width: 100%;">
                <img src="${imageUrl}" alt="${imageAlt}" class="${imageUniqueId}" />
                ${imageCaption ? `<figcaption class="${captionUniqueId}">${imageCaption}</figcaption>` : ''}
              </figure>
            </div>
          `;

        case 'ad':
          if (getAdBlockType(blockContent) === 'link') {
            const adLinkText = blockContent.text || '';
            const adLinkUrl = blockContent.link || '';
            const adTextAlign = block.styles?.textAlign || 'center';
            const adLinkUniqueId = `ad-link-${index}-${Date.now()}`;

            const adLinkInlineStyle = getAdLinkTextCss(block.styles);
            const adLinkTag = adLinkUrl
              ? `<a href="${adLinkUrl}" target="_blank" rel="noopener noreferrer sponsored" style="${adLinkInlineStyle}">${adLinkText}</a>`
              : `<span style="${adLinkInlineStyle}">${adLinkText}</span>`;

            const adLinkCssStyles = `
              .container-${adLinkUniqueId} {
                margin-bottom: 32px !important;
                text-align: ${adTextAlign} !important;
              }
            `;

            return `
              <style>${adLinkCssStyles}</style>
              <div class="container-${adLinkUniqueId}">${adLinkTag}</div>
            `;
          }

          const adUrl = blockContent.url || '';
          const adLink = blockContent.link || '';
          const adAlt = blockContent.alt || 'Advertisement';
          const adCaption = blockContent.caption || '';
          const isAdVideo = /\.(mp4|webm|mov|avi|m4v|ogg)(\?.*)?$/i.test(adUrl);
          const adUniqueId = `ad-${index}-${Date.now()}`;
          const adCaptionUniqueId = `ad-caption-${index}-${Date.now()}`;

          const adCssStyles = `
            .container-${adUniqueId} {
              margin-bottom: 32px !important;
            }
            .${adUniqueId} {
              width: 100% !important;
              height: auto !important;
              max-width: 100% !important;
              border-radius: 8px !important;
              display: block !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            }
            ${adLink ? getAdMediaLinkHoverCss() : ''}
            .${adCaptionUniqueId} {
              text-align: center !important;
              font-size: 0.875rem !important;
              color: #6b7280 !important;
              margin-top: 12px !important;
              font-style: italic !important;
            }
          `;

          const adMediaTag = isAdVideo
            ? `<video src="${adUrl}" class="${adUniqueId}" controls muted playsinline preload="metadata"></video>`
            : `<img src="${adUrl}" alt="${adAlt}" class="${adUniqueId}" />`;
          const adLinkedMediaTag = adLink
            ? `<a href="${adLink}" target="_blank" rel="noopener noreferrer sponsored" class="${AD_MEDIA_LINK_CLASS}">${adMediaTag}</a>`
            : adMediaTag;

          return `
            <style>${adCssStyles}</style>
            <div class="container-${adUniqueId}">
              <figure style="width: 100%;">
                ${adLinkedMediaTag}
                ${adCaption ? `<figcaption class="${adCaptionUniqueId}">${adCaption}</figcaption>` : ''}
              </figure>
            </div>
          `;

        case 'button':
          const buttonText = blockContent.text || 'Click here';
          const buttonUrl = blockContent.url || '#';
          const buttonTarget = blockContent.target || '_self';
          const buttonWidth = blockContent.width || 'auto';
          const buttonAlignment = blockContent.alignment || 'left';
          const buttonStyles = block.styles || {};
          const backgroundColor = buttonStyles.backgroundColor || '#3b82f6';
          const textColor = buttonStyles.textColor || '#ffffff';
          const buttonBorderRadius = buttonStyles.border?.radius || 6;
          const borderWidth = buttonStyles.border?.width || 0;
          const borderColor = buttonStyles.border?.color || 'transparent';
          const fontSize = buttonStyles.fontSize || '1rem';
          const fontWeight = buttonStyles.fontWeight || '500';
          const paddingTop = buttonStyles.padding?.top || 12;
          const paddingBottom = buttonStyles.padding?.bottom || 12;
          const paddingLeft = buttonStyles.padding?.left || 24;
          const paddingRight = buttonStyles.padding?.right || 24;
          const buttonUniqueId = `button-${index}-${Date.now()}`;

          const buttonCssStyles = `
            .container-${buttonUniqueId} {
              margin-bottom: 24px !important;
              text-align: ${buttonAlignment} !important;
            }
            .${buttonUniqueId} {
              background-color: ${backgroundColor} !important;
              color: ${textColor} !important;
              border-radius: ${buttonBorderRadius}px !important;
              border: ${borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'} !important;
              font-size: ${fontSize} !important;
              font-weight: ${fontWeight} !important;
              padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px !important;
              display: ${buttonWidth === 'full' ? 'block' : 'inline-block'} !important;
              width: ${buttonWidth === 'full' ? '100%' : buttonWidth === 'custom' ? `${blockContent.customWidth || 200}px` : 'auto'} !important;
              text-decoration: none !important;
              text-align: center !important;
              transition: all 0.2s ease !important;
              cursor: pointer !important;
              margin-top: ${buttonStyles.margin?.top ? `${buttonStyles.margin.top}px` : '0'} !important;
              margin-bottom: ${buttonStyles.margin?.bottom ? `${buttonStyles.margin.bottom}px` : '0'} !important;
              margin-left: ${buttonStyles.margin?.left ? `${buttonStyles.margin.left}px` : '0'} !important;
              margin-right: ${buttonStyles.margin?.right ? `${buttonStyles.margin.right}px` : '0'} !important;
            }
            .${buttonUniqueId}:hover {
              opacity: 0.9 !important;
            }
          `;

          return `
            <style>${buttonCssStyles}</style>
            <div class="container-${buttonUniqueId}">
              <a href="${buttonUrl}" target="${buttonTarget}" ${buttonTarget === '_blank' ? 'rel="noopener noreferrer"' : ''} class="${buttonUniqueId}">
                ${buttonText}
              </a>
            </div>
          `;

        case 'quote':
          const quoteText = blockContent.text || '';
          const quoteAuthor = blockContent.author || blockContent.caption || '';
          const quoteCitation = blockContent.citation || '';
          const quoteUniqueId = `quote-${index}-${Date.now()}`;
          const quoteStyles = block.styles || {};

          const quoteCssStyles = `
            .${quoteUniqueId} {
              font-size: ${quoteStyles.fontSize || '1.25rem'} !important;
              text-align: ${quoteStyles.textAlign || 'left'} !important;
              color: ${quoteStyles.textColor || '#1f2937'} !important;
              background-color: ${quoteStyles.backgroundColor || '#eff6ff'} !important;
              border-radius: ${quoteStyles.border?.radius ? `${quoteStyles.border.radius}px` : '8px'} !important;
              margin-top: ${quoteStyles.margin?.top ? `${quoteStyles.margin.top}px` : '0'} !important;
              margin-bottom: ${quoteStyles.margin?.bottom ? `${quoteStyles.margin.bottom}px` : '24px'} !important;
              margin-left: ${quoteStyles.margin?.left ? `${quoteStyles.margin.left}px` : '0'} !important;
              margin-right: ${quoteStyles.margin?.right ? `${quoteStyles.margin.right}px` : '0'} !important;
              padding-top: ${quoteStyles.padding?.top ? `${quoteStyles.padding.top}px` : '24px'} !important;
              padding-bottom: ${quoteStyles.padding?.bottom ? `${quoteStyles.padding.bottom}px` : '24px'} !important;
              padding-left: ${quoteStyles.padding?.left ? `${quoteStyles.padding.left}px` : '32px'} !important;
              padding-right: ${quoteStyles.padding?.right ? `${quoteStyles.padding.right}px` : '32px'} !important;
              border-left: 4px solid ${quoteStyles.accentColor || '#3b82f6'} !important;
              font-style: italic !important;
              border-top-right-radius: 8px !important;
              border-bottom-right-radius: 8px !important;
            }
            .${quoteUniqueId} p {
              margin-bottom: 8px !important;
              line-height: 1.6 !important;
            }
            .${quoteUniqueId} cite {
              font-size: 0.875rem !important;
              font-style: normal !important;
              font-weight: 500 !important;
              opacity: 0.8 !important;
            }
          `;

          return `
            <style>${quoteCssStyles}</style>
            <blockquote class="${quoteUniqueId}">
              <p>${renderTextContent(quoteText)}</p>
              ${(quoteAuthor || quoteCitation) ? `
                <cite>
                  — ${quoteAuthor}${quoteCitation && quoteAuthor ? ', ' : ''}${quoteCitation}
                </cite>
              ` : ''}
            </blockquote>
          `;

        case 'list':
          const listItems = blockContent.items || [];
          const isOrdered = blockContent.ordered || blockContent.style === 'ordered';
          const listTag = isOrdered ? 'ol' : 'ul';
          const listUniqueId = `list-${index}-${Date.now()}`;
          const listStyles = block.styles || {};

          const listCssStyles = `
            .${listUniqueId} {
              margin-top: ${listStyles.margin?.top ? `${listStyles.margin.top}px` : '0'} !important;
              margin-bottom: ${listStyles.margin?.bottom ? `${listStyles.margin.bottom}px` : '16px'} !important;
              margin-left: ${listStyles.margin?.left ? `${listStyles.margin.left}px` : '0'} !important;
              margin-right: ${listStyles.margin?.right ? `${listStyles.margin.right}px` : '0'} !important;
              padding-top: ${listStyles.padding?.top ? `${listStyles.padding.top}px` : '8px'} !important;
              padding-bottom: ${listStyles.padding?.bottom ? `${listStyles.padding.bottom}px` : '8px'} !important;
              padding-left: ${listStyles.padding?.left ? `${listStyles.padding.left}px` : '24px'} !important;
              padding-right: ${listStyles.padding?.right ? `${listStyles.padding.right}px` : '0'} !important;
              font-size: ${listStyles.fontSize || '1rem'} !important;
              color: ${listStyles.textColor || '#1f2937'} !important;
              background-color: ${listStyles.backgroundColor || 'transparent'} !important;
              list-style-type: ${isOrdered ? 'decimal' : 'disc'} !important;
              list-style-position: outside !important;
            }
            .${listUniqueId} li {
              margin-bottom: 8px !important;
              line-height: 1.6 !important;
            }
          `;

          const listItemsHtml = listItems.map((item: string, itemIndex: number) => 
            `<li>${renderTextContent(item)}</li>`
          ).join('');

          return `
            <style>${listCssStyles}</style>
            <${listTag} class="${listUniqueId}">
              ${listItemsHtml}
            </${listTag}>
          `;

        case 'video':
          const videoUrl = blockContent?.url || '';
          const videoTitle = blockContent?.title || 'Video';
          const videoControls = blockContent?.controls !== false;
          const videoAutoplay = blockContent?.autoplay === true;
          const videoMuted = blockContent?.muted === true;
          const videoStyles = block.styles || {};
          const videoWidth = videoStyles.width || 100;
          const videoHeight = videoStyles.height !== undefined ? videoStyles.height : 400;
          const videoWidthUnit = videoStyles.widthUnit || '%';
          const videoHeightUnit = videoStyles.heightUnit || 'px';
          const videoAlign = videoStyles.videoAlign || 'center';
          const videoBorderRadius = videoStyles.border?.radius || 8;

          const videoContainerAlignment = videoAlign === 'center' ? 'text-center' : videoAlign === 'right' ? 'text-right' : 'text-left';
          const videoUniqueId = `video-${index}-${Date.now()}`;
          const videoContainerUniqueId = `video-container-${index}-${Date.now()}`;

          const videoCssStyles = `
            .${videoContainerUniqueId} {
              margin-bottom: 32px !important;
              text-align: ${videoAlign} !important;
            }
            .${videoUniqueId} {
              width: ${videoWidth}${videoWidthUnit} !important;
              height: ${videoHeight}${videoHeightUnit} !important;
              border-radius: ${videoBorderRadius}px !important;
              display: block !important;
              margin: ${videoAlign === 'center' ? '0 auto' : videoAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0'} !important;
              border: 1px solid #e5e7eb !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            }
          `;

          if (!videoUrl) {
            return `
              <style>${videoCssStyles}</style>
              <div class="${videoContainerUniqueId}">
                <div class="${videoUniqueId}" style="background-color: #e5e7eb; display: flex; align-items: center; justify-content: center;">
                  <div style="text-align: center; color: #6b7280;">
                    <svg style="width: 48px; height: 48px; margin: 0 auto 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p style="font-size: 0.875rem;">Video</p>
                  </div>
                </div>
              </div>
            `;
          }

          // Check if it's a YouTube URL and convert to embed
          let embedHtml = '';
          if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.includes('youtube.com/watch') 
              ? videoUrl.split('v=')[1]?.split('&')[0]
              : videoUrl.split('youtu.be/')[1]?.split('?')[0];
              
            if (videoId) {
              embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" title="${videoTitle}" class="${videoUniqueId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
          } else if (videoUrl.startsWith('http')) {
            embedHtml = `<video src="${videoUrl}" title="${videoTitle}" class="${videoUniqueId}" ${videoControls ? 'controls' : ''} ${videoAutoplay ? 'autoplay' : ''} ${videoMuted ? 'muted' : ''}><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
          }

          return `
            <style>${videoCssStyles}</style>
            <div class="${videoContainerUniqueId}">
              <div style="width: 100%;">
                ${embedHtml}
              </div>
              ${videoTitle && videoTitle !== 'Video' && videoTitle !== 'Video title' ? `
                <p style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 8px; font-style: italic;">
                  ${videoTitle}
                </p>
              ` : ''}
            </div>
          `;

        default:
          return `<!-- Unsupported block type: ${block.type} -->`;
      }
    }).join('\n');
  };

  const categoryNames = getCategoryNames(blogPost.categories);
  const tagNames = getTagNames(blogPost.tags);
  const processedContent = processContent(blogPost.content);

  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
  
    const previewContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blog Preview - ${blogPost.title || 'Blog Post'}</title>      
          <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Copy all the editor styles to ensure consistency */

          /* Match the actual blog preview layout */
          .blog-preview-container {
            min-height: 100vh;
            background-color: #fafafa;
          }

          .blog-preview-main {
            max-width: 1536px; /* 6xl */
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          @media (min-width: 640px) {
            .blog-preview-main {
              padding: 2rem 1.5rem;
            }
          }

          @media (min-width: 1024px) {
            .blog-preview-main {
              padding: 2rem 2rem;
            }
          }

          .blog-preview-article {
            overflow: hidden;
          }

          .blog-preview-content-wrapper {
            padding: 2rem 1.5rem;
          }

          @media (min-width: 768px) {
            .blog-preview-content-wrapper {
              padding: 2.5rem 2rem;
            }
          }

          /* Ensure proper text sizing matches the actual preview */
          .blog-preview-title {
            font-size: 1.875rem;
            line-height: 1.1;
          }

          @media (min-width: 768px) {
            .blog-preview-title {
              font-size: 2.25rem;
            }
          }

          @media (min-width: 1024px) {
            .blog-preview-title {
              font-size: 3rem;
            }
          }

          .blog-preview-excerpt {
            font-size: 1.25rem;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 2rem;
          }

          .blog-preview-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body class="blog-preview-container">
        <main class="blog-preview-main">
          <article class="blog-preview-article">
            <div class="blog-preview-content-wrapper">
              <div class="mb-6">
                <span class="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
                  Preview Mode
                </span>            
              </div>
              <h1 class="blog-preview-title font-bold text-gray-900 mb-6">
                ${blogPost.title || 'Untitled Post'}
              </h1>
              ${blogPost.permalink ? `
                <div class="mb-4">
                  <span class="text-sm text-gray-500">
                    Permalink: 
                    <span class="text-blue-600 ml-1 font-mono">
                      /blog/${blogPost.permalink}
                    </span>
                  </span>
                </div>
              ` : ''}
              <div class="blog-preview-meta">
                <span class="text-sm text-gray-600">Published on ${new Date(blogPost.publishDate).toLocaleDateString()}</span>
                ${categoryNames.length > 0 ? `
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ${categoryNames.join(', ')}
                    </span>
                  </div>
                ` : ''}
              </div>

              ${blogPost.excerpt ? `
                <p class="blog-preview-excerpt">${blogPost.excerpt}</p>
              ` : ''}

              <div class="prose prose-lg max-w-none">
                <div class="text-gray-800 leading-relaxed blog-preview-content">
                  ${processedContent}
                </div>
              </div>          
              
              ${tagNames.length > 0 ? `
                <div class="mt-8">
                  <div class="flex items-center mb-3">
                    <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-sm font-medium text-gray-700">Tags</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    ${tagNames.map(tag => `
                      <span class="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                        ${tag}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </article>
        </main>
      </body>
      </html>
    `;
    
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
  }
};
