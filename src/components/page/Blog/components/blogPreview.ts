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
        <title>Blog Preview - ${blogPost.title || 'Untitled Post'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          .blog-preview-content h1 { @apply text-3xl font-bold mb-4; }
          .blog-preview-content h2 { @apply text-2xl font-semibold mb-3; }
          .blog-preview-content h3 { @apply text-xl font-medium mb-2; }
          .blog-preview-content p { @apply mb-4; }
          .blog-preview-content ul, .blog-preview-content ol { @apply mb-4 pl-6; }
          .blog-preview-content li { @apply mb-1; }
          .blog-preview-content blockquote { @apply border-l-4 border-gray-300 pl-4 italic mb-4; }
          .blog-preview-content img { @apply max-w-full h-auto mb-4; }
        </style>
      </head>
      <body class="bg-gray-50 dark:bg-gray-900">
        <div class="max-w-4xl mx-auto p-6">
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
