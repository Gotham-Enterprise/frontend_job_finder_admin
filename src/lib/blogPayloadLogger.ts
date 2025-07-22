import { BlogPayload, BlogValidationResult, BlogAnalytics } from '@/types/blog';

export const logPayloadFormatted = (
  payload: BlogPayload, 
  apiPayload: Record<string, any>, 
  validation: BlogValidationResult,
  action: 'publish' | 'draft' = 'publish'
) => {
    
  return {
    summary: {
      title: payload.title,
      status: payload.metadata.status,
      blocksCount: payload.content.blocks.length,
      wordCount: payload.analytics?.wordCount,
      isValid: validation.isValid,
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0
    },
    payload,
    apiPayload,
    validation
  };
};

export const generatePayloadPreview = (payload: BlogPayload): string => {
  return `
Blog Post Preview:
─────────────────
Title: ${payload.title}
Status: ${payload.metadata.status}
Visibility: ${payload.metadata.visibility}
Publish Date: ${payload.metadata.publishDate}

Content:
- ${payload.content.blocks.length} content blocks
- ${payload.analytics?.wordCount || 0} words
- ${payload.analytics?.estimatedReadTime || 0} min read

Categories: ${payload.metadata.categories.map(cat => cat.name).join(', ') || 'None'}
Tags: ${payload.metadata.tags.map(tag => tag.name).join(', ') || 'None'}

SEO:
- Title: ${payload.metadata.seo.title}
- Description: ${payload.metadata.seo.description}
- Score: ${(payload.analytics as BlogAnalytics)?.seoScore || 0}/100
  `;
};
