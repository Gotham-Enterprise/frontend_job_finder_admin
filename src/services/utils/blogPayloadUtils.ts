import { authUtils } from '@/services/utils/authUtils';
import { CategoryWithSubCategories } from '@/services/types/subCategoryTypes';


export interface BlogCreatePayload {
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featuredImage: string;
  metadata: {
    status: string;
    visibility?: string;
    publishDate: string;
    categories: Array<{
      id: string;
      name: string;
      subCategory?: Array<{
        id: string;
        name: string;
      }>;
    }>;
    tags: Array<{
      id: string;
      name: string;
    }>;
    seo: {
      title: string;
      description: string;
      keywords: string[];
      canonicalUrl?: string;
    };
    settings: {
      allowComments: boolean;
      allowPings: boolean;
      featured?: boolean;
      sticky?: boolean;
    };
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
  analytics: {
    seoScore: number;
    wordCount: number;
    characterCount: number;
    readabilityScore: number;
    estimatedReadTime: number;
  };
}

export interface BlogMetadata {
  title: string;
  permalink: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string;
  subCategories: string[];
  tags: string[];
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  allowPings: boolean;
}

export interface LayoutBlock {
  id: string;
  type: string;
  content: any;
  styles?: any;
  position?: any;
  metadata?: any;
}


function calculateAnalytics(content: any, title: string): BlogCreatePayload['analytics'] {
  
  let textContent = '';
  
  if (typeof content === 'string') {
   
    textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  } else if (content && content.blocks && Array.isArray(content.blocks)) {
   
    textContent = content.blocks
      .map((block: any) => {
        if (typeof block.content === 'string') {
          return block.content.replace(/<[^>]*>/g, ' ');
        }
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (Array.isArray(content)) {
   
    textContent = content
      .map(block => {
        if (typeof block.content === 'string') {
          return block.content.replace(/<[^>]*>/g, ' ');
        }
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const wordCount = textContent ? textContent.split(/\s+/).length : 0;
  const characterCount = textContent.length;
  

  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
  

  let seoScore = 0;
  if (title && title.length > 10 && title.length < 60) seoScore += 20;
  if (wordCount > 300) seoScore += 20;
  if (wordCount > 1000) seoScore += 10;
  if (textContent.toLowerCase().includes(title.toLowerCase().split(' ')[0])) seoScore += 20;
  seoScore += Math.min(30, Math.floor(wordCount / 100) * 5); 
  

  const avgWordsPerSentence = textContent ? textContent.split(/[.!?]+/).length / wordCount * 100 : 50;
  const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence));

  return {
    seoScore,
    wordCount,
    characterCount,
    readabilityScore,
    estimatedReadTime
  };
}


export function transformBlogDataForAPI(
  metadata: BlogMetadata,
  blocks: LayoutBlock[],
  categoryOptions: Array<{ value: string; text: string }>,
  tagOptions: Array<{ value: string; text: string }>,
  fullCategoriesData?: CategoryWithSubCategories[]
): BlogCreatePayload {
  const user = authUtils.getUser();
  const userDisplayName = authUtils.getUserDisplayName();

  const featuredImage = metadata.featuredImage || '';

  const content = {
    blocks: blocks.length > 0 ? blocks : [],
    version: "1.0.0",
    time: Date.now()
  };

  const selectedCategories = metadata.categories
    ? metadata.categories.split(',').map(id => id.trim()).filter(Boolean)
    : [];

  const categories = selectedCategories.length > 0 
    ? selectedCategories.map(categoryId => {
        const category = categoryOptions.find(opt => opt.value === categoryId);
        
        const selectedSubCategories = metadata.subCategories || [];
        console.log('DEBUG: Selected subcategories from metadata:', selectedSubCategories);
        
    
        const fullCategoryData = fullCategoriesData?.find(cat => cat.id === categoryId);
        
        const filteredSubCategories = fullCategoryData?.subCategories 
          ? fullCategoryData.subCategories.filter(sub => selectedSubCategories.includes(sub.id))
          : [];
        
        console.log('DEBUG: Filtered subcategories for payload:', filteredSubCategories);
        
        return {
          id: categoryId,
          name: category?.text || categoryId,
          subCategory: filteredSubCategories.map(sub => ({
            id: sub.id,
            name: sub.name
          }))
        };
      })
    : [];

  const tags = metadata.tags && metadata.tags.length > 0
    ? metadata.tags.map(tagId => {
        const tag = tagOptions.find(opt => opt.value === tagId);
        return {
          id: tagId,
          name: tag?.text || tagId
        };
      })
    : [];

  const analytics = calculateAnalytics(content, metadata.title);

  const keywords = [
    ...metadata.seoTitle.split(' ').filter(word => word.length > 3),
    ...metadata.seoDescription.split(' ').filter(word => word.length > 3)
  ].slice(0, 10); 

  const payload = {
    title: metadata.title,
    slug: metadata.permalink,
    excerpt: metadata.excerpt,
    content,
    featuredImage: featuredImage,
    metadata: {
      status: metadata.status,
      visibility: metadata.visibility,
      publishDate: metadata.publishDate,
      categories,
      tags,
      seo: {
        title: metadata.seoTitle || metadata.title,
        description: metadata.seoDescription || metadata.excerpt,
        keywords,
        canonicalUrl: `${window.location.origin}/blog/${metadata.permalink}`
      },
      settings: {
        allowComments: metadata.allowComments,
        allowPings: metadata.allowPings,
        featured: false,
        sticky: false
      },
      author: {
        id: user?.id || 'guest-user',
        name: userDisplayName || 'Guest User',
        email: user?.email || 'guest@example.com'
      }
    },
    analytics
  };


  return payload;
}

export function validateBlogData(data: BlogCreatePayload): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  }

  if (!data.content) {
    errors.push('Content is required');
  }

  if (!data.metadata.author.id) {
    errors.push('Author information is required');
  }

  if (data.featuredImage === undefined || data.featuredImage === null) {
    console.error('Featured image validation failed:', {
      featuredImage: data.featuredImage,
      type: typeof data.featuredImage
    });
    errors.push('Featured image property is required (can be empty string)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
