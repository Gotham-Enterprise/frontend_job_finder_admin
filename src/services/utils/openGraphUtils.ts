import { SITE_CONFIG } from '@/config/constants';

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const generateOpenGraphTags = (data: OpenGraphData) => {
  const tags = [
    { property: 'og:type', content: data.type || 'article' },
    { property: 'og:title', content: data.title },
    { property: 'og:description', content: data.description },
    { property: 'og:url', content: data.url },
    { property: 'og:site_name', content: data.siteName || 'Gotham Enterprises' },
    { property: 'og:image', content: data.image || SITE_CONFIG.DEFAULT_SHARE_IMAGE },
  ];

  if (data.type === 'article' || !data.type) {
    if (data.author) {
      tags.push({ property: 'article:author', content: data.author });
    }
    if (data.publishedTime) {
      tags.push({ property: 'article:published_time', content: new Date(data.publishedTime).toISOString() });
    }
    if (data.modifiedTime) {
      tags.push({ property: 'article:modified_time', content: new Date(data.modifiedTime).toISOString() });
    }
    if (data.section) {
      tags.push({ property: 'article:section', content: data.section });
    }
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        tags.push({ property: 'article:tag', content: tag });
      });
    }
  }

  return tags;
};

export const generateTwitterCardTags = (data: OpenGraphData) => {
  return [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: data.title },
    { name: 'twitter:description', content: data.description },
    { name: 'twitter:image', content: data.image || SITE_CONFIG.DEFAULT_SHARE_IMAGE },
  ];
};


export const generateStructuredData = (data: OpenGraphData) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image || SITE_CONFIG.DEFAULT_SHARE_IMAGE,
    "author": {
      "@type": "Person",
      "name": data.author || "Gotham Enterprises"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gotham Enterprises",
      "url": "https://gothamenterprisesltd.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    }
  };

  
  if (data.publishedTime) {
    (structuredData as any).datePublished = new Date(data.publishedTime).toISOString();
  }
  if (data.modifiedTime) {
    (structuredData as any).dateModified = new Date(data.modifiedTime).toISOString();
  }
  if (data.section) {
    (structuredData as any).articleSection = data.section;
  }
  if (data.tags && data.tags.length > 0) {
    (structuredData as any).keywords = data.tags.join(', ');
  }

  return structuredData;
};


export const extractBlogOpenGraphData = (blogPost: any): OpenGraphData => {
  const getAuthorName = (): string => {
    const metadataAuthor = blogPost?.metadata?.author;
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


  const getDescription = (): string => {
    const seoDescription = blogPost?.seo?.description;
    if (seoDescription && seoDescription.trim()) {
      return seoDescription;
    }
    if (blogPost.excerpt && blogPost.excerpt.trim()) {
      return blogPost.excerpt;
    }
    return `Read about ${blogPost.title} on Gotham Enterprises blog.`;
  };

  const getImage = (): string => {
    const image = blogPost.featuredImage || 
                 blogPost.image || 
                 blogPost?.metadata?.image ||
                 blogPost?.thumbnail;
    
    if (image) {
      if (typeof image === 'string') {
        return image;
      } else if (typeof image === 'object' && image.url) {
        return image.url;
      }
    }
    
    return SITE_CONFIG.DEFAULT_SHARE_IMAGE;
  };

  const getSection = (): string => {
    const metadataCategories = blogPost?.metadata?.categories;
    if (metadataCategories && Array.isArray(metadataCategories) && metadataCategories.length > 0) {
      const firstCategory = metadataCategories[0];
      return firstCategory?.name || 'Blog';
    }
    
    if (blogPost.category) {
      if (typeof blogPost.category === 'string') {
        return blogPost.category;
      } else if (blogPost.category && typeof blogPost.category === 'object') {
        return blogPost.category.name || 'Blog';
      }
    }
    
    return 'Blog';
  };

 
  const getTags = (): string[] => {
    if (!blogPost.tags || !Array.isArray(blogPost.tags)) return [];
    
    return blogPost.tags
      .map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || ''))
      .filter(Boolean);
  };

  return {
    title: blogPost.title,
    description: getDescription(),
    url: '', 
    image: getImage(),
    type: 'article',
    siteName: 'Gotham Enterprises',
    author: getAuthorName(),
    publishedTime: blogPost.createdAt,
    modifiedTime: blogPost.updatedAt,
    section: getSection(),
    tags: getTags()
  };
};
