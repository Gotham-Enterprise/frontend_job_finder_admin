import { LayoutBlock } from '@/services/types/visualLayoutTypes';
import { BlogMetadata } from '@/types/blog';

interface BlogPreviewData {
  metadata: {
    title: string;
    permalink: string;
    excerpt: string;
    publishDate: string;
    categories: string[];
    tags: string[];
  };
  layout: LayoutBlock[];
}

interface CategoryOption {
  value: string;
  text: string;
}

interface TagOption {
  value: string;
  text: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const renderBlockContent = (block: LayoutBlock): string => {
  const baseStyles = `
    margin-top: ${block.styles.margin?.top || 0}px;
    margin-bottom: ${block.styles.margin?.bottom || 0}px;
    margin-left: ${block.styles.margin?.left || 0}px;
    margin-right: ${block.styles.margin?.right || 0}px;
    padding-top: ${block.styles.padding?.top || 0}px;
    padding-bottom: ${block.styles.padding?.bottom || 0}px;
    padding-left: ${block.styles.padding?.left || 0}px;
    padding-right: ${block.styles.padding?.right || 0}px;
  `;

  switch (block.type) {
    case 'heading':
      const level = block.content?.level || 1;
      const headingStyles = `
        font-size: ${block.styles.fontSize || '2rem'};
        font-weight: ${block.styles.fontWeight || 'bold'};
        color: ${block.styles.textColor || '#000000'};
        text-align: ${block.styles.textAlign || 'left'};
        line-height: ${block.styles.lineHeight || '1.3'};
        letter-spacing: ${block.styles.letterSpacing || '0px'};
        ${baseStyles}
      `;
      return `<h${level} style="${headingStyles}">${block.content?.text || ''}</h${level}>`;

    case 'paragraph':
      const paragraphStyles = `
        font-size: ${block.styles.fontSize || '1rem'};
        font-weight: ${block.styles.fontWeight || 'normal'};
        color: ${block.styles.textColor || '#000000'};
        text-align: ${block.styles.textAlign || 'left'};
        line-height: ${block.styles.lineHeight || '1.6'};
        letter-spacing: ${block.styles.letterSpacing || '0px'};
        ${baseStyles}
      `;
      return `<p style="${paragraphStyles}">${block.content?.text || ''}</p>`;

    case 'image':
      const imageStyles = `
        max-width: 100%;
        height: ${block.styles.height || 'auto'};
        border-radius: ${block.styles.border?.radius || 8}px;
        text-align: ${block.styles.imageAlign || 'center'};
        ${baseStyles}
      `;
      const containerStyle = `text-align: ${block.styles.imageAlign || 'center'};`;
      return `<div style="${containerStyle}"><img src="${block.content?.url || ''}" alt="${block.content?.alt || ''}" style="${imageStyles}" /></div>`;

    case 'video':
      const videoStyles = `
        max-width: 100%;
        height: ${block.styles.height || 'auto'};
        text-align: ${block.styles.videoAlign || 'center'};
        ${baseStyles}
      `;
      const videoContainerStyle = `text-align: ${block.styles.videoAlign || 'center'};`;
      return `<div style="${videoContainerStyle}"><video controls style="${videoStyles}"><source src="${block.content?.url || ''}" type="video/mp4"></video></div>`;

    case 'quote':
      const quoteStyles = `
        border-left: 4px solid #e5e7eb;
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: italic;
        color: #6b7280;
        ${baseStyles}
      `;
      return `<blockquote style="${quoteStyles}">${block.content?.text || ''}</blockquote>`;

    case 'list':
      const listItems = (block.content?.items || []).map((item: string) => `<li>${item}</li>`).join('');
      const listType = block.content?.type === 'ordered' ? 'ol' : 'ul';
      const listStyles = `
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        ${baseStyles}
      `;
      return `<${listType} style="${listStyles}">${listItems}</${listType}>`;

    default:
      return `<div style="${baseStyles}">${block.content?.text || ''}</div>`;
  }
};

const generatePreviewHtml = (blogData: BlogPreviewData, categoryOptions: CategoryOption[], tagOptions: TagOption[]): string => {
  const categoryNames = blogData.metadata.categories
    .map(catId => categoryOptions.find(cat => cat.value === catId)?.text)
    .filter(Boolean);

  const tagNames = blogData.metadata.tags
    .map(tagId => tagOptions.find(tag => tag.value === tagId)?.text)
    .filter(Boolean);

  const contentHtml = blogData.layout.map(renderBlockContent).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${blogData.metadata.title || 'Blog Preview'}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
          padding: 2rem 1rem;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #fff 0%, #fff 100%);
          color: #000;
          padding: 2rem;
          text-align: center;
        }
        
        .preview-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
        }
        
        .title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .meta {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .meta-item:last-child {
          margin-bottom: 0;
        }
        
        .categories, .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .category, .tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .content {
          padding: 2rem;
        }
        
        .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
          margin: 1.5rem 0 1rem 0;
          font-weight: 700;
          line-height: 1.25;
        }
        
        .content h1 { font-size: 2.25rem; }
        .content h2 { font-size: 1.875rem; }
        .content h3 { font-size: 1.5rem; }
        .content h4 { font-size: 1.25rem; }
        .content h5 { font-size: 1.125rem; }
        .content h6 { font-size: 1rem; }
        
        .content p {
          margin: 1rem 0;
        }
        
        .content img {
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }
        
        .content blockquote {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 8px 8px 0;
        }
        
        .content ul, .content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .content li {
          margin: 0.5rem 0;
        }
        
        .footer {
          background: #f8fafc;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          body {
            padding: 1rem 0.5rem;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .content {
            padding: 1.5rem;
          }
          
          .header {
            padding: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="preview-badge">
            Blog Preview
          </div>
          <h1 class="title">${blogData.metadata.title || 'Untitled Post'}</h1>
          <div class="meta">
            <div class="meta-item">
              <span>Published on ${formatDate(blogData.metadata.publishDate)}</span>
            </div>
            ${categoryNames.length > 0 ? `
              <div class="meta-item">
                <span>Categories:</span>
                <div class="categories">
                  ${categoryNames.map(name => `<span class="category">${name}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${tagNames.length > 0 ? `
              <div class="meta-item">
                <span>Tags:</span>
                <div class="tags">
                  ${tagNames.map(name => `<span class="tag">${name}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${blogData.metadata.permalink ? `
              <div class="meta-item">
                <span>Permalink: /blog/${blogData.metadata.permalink}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="content">
          ${contentHtml || '<p style="text-align: center; color: #6b7280; font-style: italic;">No content available for preview.</p>'}
        </div>
        
        <div class="footer">
          <p>This is a preview of your blog post. The actual published version may look different.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const openBlogPreview = (
  metadata: any,
  layout: LayoutBlock[],
  categoryOptions: CategoryOption[],
  tagOptions: TagOption[]
): void => {
  const blogData: BlogPreviewData = {
    metadata: {
      title: metadata.title || 'Untitled Post',
      permalink: metadata.permalink || '',
      excerpt: metadata.excerpt || '',
      publishDate: metadata.publishDate || new Date().toISOString(),
      categories: Array.isArray(metadata.categories) ? metadata.categories : 
                  typeof metadata.categories === 'string' ? [metadata.categories] : [],
      tags: Array.isArray(metadata.tags) ? metadata.tags : []
    },
    layout
  };

  const previewHtml = generatePreviewHtml(blogData, categoryOptions, tagOptions);
  
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
    previewWindow.focus();
  } else {
    console.warn('Unable to open preview window. Please check your popup blocker settings.');
  }
};

export { openBlogPreview, generatePreviewHtml };
export type { BlogPreviewData, CategoryOption, TagOption };
