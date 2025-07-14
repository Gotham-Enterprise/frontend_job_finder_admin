interface BlogPost {
  title: string;
  permalink: string;
  content: string;
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

  const categoryNames = getCategoryNames(blogPost.categories);
  const tagNames = getTagNames(blogPost.tags);

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
          .blog-preview-content {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            line-height: 1.6;
          }

          .blog-preview-content p {
            margin: 0.75rem 0;
          }

          .blog-preview-content p.mb-3 {
            margin-bottom: 0.75rem;
          }

          .blog-preview-content p + p {
            margin-top: 0.75rem;
          }

          .blog-preview-content p:empty {
            margin: 0.75rem 0;
            min-height: 1.2em;
          }

          .blog-preview-content h1,
          .blog-preview-content h2,
          .blog-preview-content h3,
          .blog-preview-content h4,
          .blog-preview-content h5,
          .blog-preview-content h6 {
            margin: 1rem 0 0.5rem 0;
            font-weight: 700;
            line-height: 1.25;
            color: inherit;
          }

          .blog-preview-content h1 {
            font-size: 2.25rem;
            font-weight: 800;
          }

          .blog-preview-content h2 {
            font-size: 1.875rem;
            font-weight: 700;
          }

          .blog-preview-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .blog-preview-content h4 {
            font-size: 1.25rem;
            font-weight: 600;
          }

          .blog-preview-content h5 {
            font-size: 1.125rem;
            font-weight: 600;
          }

          .blog-preview-content h6 {
            font-size: 1rem;
            font-weight: 600;
          }

          .blog-preview-content ul,
          .blog-preview-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .blog-preview-content ul {
            list-style-type: disc;
          }

          .blog-preview-content ol {
            list-style-type: decimal;
          }

          .blog-preview-content li {
            margin: 0.25rem 0;
            display: list-item;
          }

          .blog-preview-content ul li {
            list-style-type: disc;
          }

          .blog-preview-content ol li {
            list-style-type: decimal;
          }

          .blog-preview-content img {
            margin: 1rem 0;
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
          }

          .blog-preview-content a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            text-decoration-color: #3b82f6 !important;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .blog-preview-content a:hover {
            color: #1d4ed8 !important;
            text-decoration-color: #1d4ed8 !important;
          }

          .dark .blog-preview-content a {
            color: #60a5fa !important;
            text-decoration-color: #60a5fa !important;
          }

          .dark .blog-preview-content a:hover {
            color: #93c5fd !important;
            text-decoration-color: #93c5fd !important;
          }

          .blog-preview-content strong,
          .blog-preview-content b {
            font-weight: 700 !important;
          }

          .blog-preview-content em,
          .blog-preview-content i {
            font-style: italic !important;
          }

          .blog-preview-content u {
            text-decoration: underline !important;
          }

          .blog-preview-content s {
            text-decoration: line-through !important;
          }

          .blog-preview-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #6b7280;
          }

          .dark .blog-preview-content blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
          }

          .blog-preview-content code {
            background-color: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
          }

          .dark .blog-preview-content code {
            background-color: #374151;
            color: #e5e7eb;
          }

          .blog-preview-content pre {
            background-color: #f3f4f6;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }

          .dark .blog-preview-content pre {
            background-color: #1f2937;
          }

          .blog-preview-content pre code {
            background: none;
            padding: 0;
            font-size: 0.875rem;
            color: inherit;
          }

          /* Override Tailwind prose styles */
          .prose .blog-preview-content h1 {
            font-size: 2.25rem !important;
            font-weight: 800 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content h2 {
            font-size: 1.875rem !important;
            font-weight: 700 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content h3 {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content h4 {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content h5 {
            font-size: 1.125rem !important;
            font-weight: 600 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content h6 {
            font-size: 1rem !important;
            font-weight: 600 !important;
            line-height: 1.25 !important;
          }

          .prose .blog-preview-content strong,
          .prose .blog-preview-content b {
            font-weight: 700 !important;
          }

          .prose .blog-preview-content em,
          .prose .blog-preview-content i {
            font-style: italic !important;
          }

          .prose .blog-preview-content u {
            text-decoration: underline !important;
          }

          .prose .blog-preview-content s {
            text-decoration: line-through !important;
          }

          .prose .blog-preview-content a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            text-decoration-color: #3b82f6 !important;
            font-weight: 500 !important;
          }

          .prose .blog-preview-content a:hover {
            color: #1d4ed8 !important;
            text-decoration-color: #1d4ed8 !important;
          }

          .dark .prose .blog-preview-content a {
            color: #60a5fa !important;
            text-decoration-color: #60a5fa !important;
          }

          .dark .prose .blog-preview-content a:hover {
            color: #93c5fd !important;
            text-decoration-color: #93c5fd !important;
          }

          /* Disable template image interactions in preview */
          .blog-preview-content img[data-template-image="true"],
          .blog-preview-content img[data-template-image="replaced"] {
            cursor: not-allowed !important;
            filter: grayscale(10%);
            opacity: 0.9;
            border: 2px solid #e5e7eb !important;
            background-color: #f3f4f6 !important;
          }

          .blog-preview-content img[data-template-image="true"]:hover,
          .blog-preview-content img[data-template-image="replaced"]:hover {
            transform: none !important;
            box-shadow: none !important;
            border-color: #e5e7eb !important;
            background-color: #f3f4f6 !important;
          }
        </style>
      </head>
      <body class="bg-gray-50 dark:bg-gray-900">
        <div class="mx-auto p-6">
          <div class="mb-6">
            <span class="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-3">
              Preview Mode
            </span>            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ${blogPost.title || 'Untitled Post'}
            </h1>
            ${blogPost.permalink ? `
              <div class="mb-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  Permalink: 
                  <span class="text-blue-600 dark:text-blue-400 ml-1 font-mono">
                    /blog/${blogPost.permalink}
                  </span>
                </span>
              </div>
            ` : ''}
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span>Published on ${new Date(blogPost.publishDate).toLocaleDateString()}</span>
              ${categoryNames.length > 0 ? `
                <span class="mx-2">•</span>
                <span>Categories: ${categoryNames.join(', ')}</span>
              ` : ''}
            </div>
          </div>

          ${blogPost.excerpt ? `
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-gray-700 dark:text-gray-300 font-medium">${blogPost.excerpt}</p>
            </div>
          ` : ''}

          <div class="prose prose-lg max-w-none dark:prose-invert">
            <div class="text-gray-900 dark:text-white blog-preview-content">
              ${blogPost.content || '<p class="text-gray-500 italic">No content yet...</p>'}
            </div>
          </div>          ${tagNames.length > 0 ? `
            <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags:</h3>
              <div class="flex flex-wrap gap-2">
                ${tagNames.map(tag => `
                  <span class="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    ${tag}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
  }
};
