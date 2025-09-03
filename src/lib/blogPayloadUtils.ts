import { BlogPayload, BlogMetadata, BlogLayout, BlogValidationResult, BlogAnalytics, CategoryPayload, TagPayload } from '@/types/blog';

export const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const generateExcerptFromBlocks = (blocks: BlogLayout['blocks'], maxLength: number = 160): string => {
  const textBlocks = blocks.filter(block => 
    block.type === 'text' || block.type === 'heading'
  );
  
  let excerpt = '';
  for (const block of textBlocks) {
    const text = block.content.text || block.content.content || '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    if (excerpt.length + cleanText.length <= maxLength) {
      excerpt += cleanText + ' ';
    } else {
      const remainingLength = maxLength - excerpt.length;
      excerpt += cleanText.substring(0, remainingLength);
      break;
    }
  }
  
  return excerpt.trim() + (excerpt.length >= maxLength ? '...' : '');
};

export const calculateWordCount = (blocks: BlogLayout['blocks']): number => {
  return blocks.reduce((count, block) => {
    const text = block.content.text || block.content.content || '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const words = cleanText.split(/\s+/).filter((word: string) => word.length > 0);
    return count + words.length;
  }, 0);
};

export const calculateCharacterCount = (blocks: BlogLayout['blocks']): number => {
  return blocks.reduce((count, block) => {
    const text = block.content.text || block.content.content || '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    return count + cleanText.length;
  }, 0);
};

export const calculateEstimatedReadTime = (wordCount: number, wordsPerMinute: number = 200): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

export const calculateSeoScore = (metadata: BlogMetadata, analytics: BlogAnalytics): number => {
  let score = 0;
  const maxScore = 100;
  
  if (metadata.title.length >= 30 && metadata.title.length <= 60) score += 20;
  if (metadata.seoDescription.length >= 120 && metadata.seoDescription.length <= 160) score += 20;
  if (metadata.excerpt.length > 0) score += 10;
  if (metadata.tags.length >= 3 && metadata.tags.length <= 10) score += 15;
  if (metadata.categories.length > 0) score += 10;
  if (analytics.wordCount >= 300) score += 15;
  if (metadata.seoTitle.length > 0) score += 10;
  
  return Math.min(score, maxScore);
};

export const validateBlogPayload = (payload: BlogPayload): BlogValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!payload.title?.trim()) {
    errors.push('Blog title is required');
  } else if (payload.title.length < 10) {
    warnings.push('Blog title should be at least 10 characters long');
  } else if (payload.title.length > 100) {
    warnings.push('Blog title should be less than 100 characters');
  }
  
  if (!payload.slug?.trim()) {
    errors.push('Blog slug is required');
  }
  
  if (!payload.content?.blocks || payload.content.blocks.length === 0) {
    warnings.push('Blog content appears to be empty');
  }
  
  if (!payload.metadata?.seo?.title?.trim()) {
    warnings.push('SEO title is recommended for better search visibility');
  }
  
  if (!payload.metadata?.seo?.description?.trim()) {
    warnings.push('SEO description is recommended for better search visibility');
  } else if (payload.metadata.seo.description.length < 120) {
    warnings.push('SEO description should be at least 120 characters');
  }
  
  if (!payload.metadata?.categories || payload.metadata.categories.length === 0) {
    warnings.push('At least one category is recommended');
  }
  
  if (!payload.metadata?.tags || payload.metadata.tags.length === 0) {
    warnings.push('Tags are recommended for better discoverability');
  }
  
  if (payload.metadata?.visibility === 'password' && !payload.metadata?.password) {
    errors.push('Password is required when visibility is set to password protected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const createBlogAnalytics = (blocks: BlogLayout['blocks'], metadata?: BlogMetadata): BlogAnalytics => {
  const wordCount = calculateWordCount(blocks);
  const characterCount = calculateCharacterCount(blocks);
  const estimatedReadTime = calculateEstimatedReadTime(wordCount);
  const seoScore = metadata ? calculateSeoScore(metadata, { wordCount, characterCount, estimatedReadTime, seoScore: 0, readabilityScore: 0 }) : 0;
  
  return {
    wordCount,
    characterCount,
    estimatedReadTime,
    seoScore,
    readabilityScore: 0
  };
};

export const transformCategoryToPayload = (categoryId: string, categoryOptions: Array<{ value: string; text: string }>): CategoryPayload | null => {
  const category = categoryOptions.find(cat => cat.value === categoryId);
  if (!category) return null;
  
  return {
    id: category.value,
    name: category.text,
    slug: generateSlugFromTitle(category.text)
  };
};

export const transformTagsToPayload = (tagIds: string[], tagOptions: Array<{ value: string; text: string }>): TagPayload[] => {
  return tagIds
    .map(tagId => {
      const tag = tagOptions.find(t => t.value === tagId);
      if (!tag) return null;
      
      return {
        id: tag.value,
        name: tag.text,
        slug: generateSlugFromTitle(tag.text)
      };
    })
    .filter(Boolean) as TagPayload[];
};

export const generateBlogPayload = (
  layout: BlogLayout,
  metadata: BlogMetadata,
  categoryOptions: Array<{ value: string; text: string }>,
  tagOptions: Array<{ value: string; text: string }>,
  authorInfo?: { id: string; name: string; email: string }
): BlogPayload => {
  const analytics = createBlogAnalytics(layout.blocks, metadata);
  const excerpt = metadata.excerpt || generateExcerptFromBlocks(layout.blocks);
  const slug = generateSlugFromTitle(metadata.title);
  
  const categories: CategoryPayload[] = metadata.categories 
    ? [transformCategoryToPayload(metadata.categories, categoryOptions)].filter(Boolean) as CategoryPayload[]
    : [];
  
  const tags = transformTagsToPayload(metadata.tags, tagOptions);
  
  const seoKeywords = metadata.seoDescription
    ? metadata.seoDescription.split(/[,\s]+/).filter(keyword => keyword.length > 2).slice(0, 10)
    : [];
  
  const currentTimestamp = new Date().toISOString();
  const isPublishing = metadata.status === 'published';
  
  const payload: BlogPayload = {
    title: metadata.title,
    slug,
    excerpt,
    content: {
      blocks: layout.blocks,
      layout: {
        settings: layout.settings,
        metadata: {
          ...layout.metadata,
          updated: currentTimestamp
        }
      }
    },
    metadata: {
      status: metadata.status,
      visibility: metadata.visibility,
      password: metadata.visibility === 'password' ? metadata.password : undefined,
      publishDate: metadata.publishDate,
      categories,
      tags,
      author: authorInfo,
      seo: {
        title: metadata.seoTitle || metadata.title,
        description: metadata.seoDescription || excerpt,
        keywords: seoKeywords,
        canonicalUrl: `/${slug}`
      },
      settings: {
        allowComments: metadata.allowComments,
        allowPings: metadata.allowPings,
        featured: false,
        sticky: false
      }
    },
    timestamps: {
      created: layout.metadata.created,
      updated: currentTimestamp,
      published: isPublishing ? currentTimestamp : undefined,
      scheduled: metadata.status === 'pending' ? metadata.publishDate : undefined
    },
    analytics
  };
  
  return payload;
};

export const formatPayloadForApi = (payload: BlogPayload): Record<string, any> => {
  return {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: JSON.stringify(payload.content),
    status: payload.metadata.status,
    visibility: payload.metadata.visibility,
    password: payload.metadata.password,
    publish_date: payload.metadata.publishDate,
    categories: payload.metadata.categories.map(cat => cat.id),
    tags: payload.metadata.tags.map(tag => tag.id),
    seo_title: payload.metadata.seo.title,
    seo_description: payload.metadata.seo.description,
    seo_keywords: payload.metadata.seo.keywords.join(','),
    allow_comments: payload.metadata.settings.allowComments,
    allow_pings: payload.metadata.settings.allowPings,
    featured: payload.metadata.settings.featured,
    sticky: payload.metadata.settings.sticky,
    word_count: payload.analytics?.wordCount,
    character_count: payload.analytics?.characterCount,
    estimated_read_time: payload.analytics?.estimatedReadTime,
    seo_score: (payload.analytics as BlogAnalytics)?.seoScore,
    author_id: payload.metadata.author?.id,
    created_at: payload.timestamps.created,
    updated_at: payload.timestamps.updated,
    published_at: payload.timestamps.published,
    scheduled_at: payload.timestamps.scheduled
  };
};
