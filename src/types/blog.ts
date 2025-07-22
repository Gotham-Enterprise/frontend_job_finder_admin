export interface BlogLayoutBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'video' | 'list' | 'quote' | 'button' | 'column' | 'divider';
  content: Record<string, any>;
  styles: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    created: string;
    updated: string;
    version?: string;
  };
}

export interface BlogLayout {
  id: string;
  name: string;
  blocks: BlogLayoutBlock[];
  settings: {
    maxWidth: number;
    backgroundColor: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  metadata: {
    created: string;
    updated: string;
    version: string;
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
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  allowPings: boolean;
}

export interface BlogPayload {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: {
    blocks: BlogLayoutBlock[];
    layout: {
      settings: BlogLayout['settings'];
      metadata: BlogLayout['metadata'];
    };
  };
  metadata: {
    status: BlogMetadata['status'];
    visibility: BlogMetadata['visibility'];
    password?: string;
    publishDate: string;
    categories: CategoryPayload[];
    tags: TagPayload[];
    author?: {
      id: string;
      name: string;
      email: string;
    };
    seo: {
      title: string;
      description: string;
      keywords: string[];
      canonicalUrl?: string;
    };
    settings: {
      allowComments: boolean;
      allowPings: boolean;
      featured: boolean;
      sticky: boolean;
    };
  };
  timestamps: {
    created: string;
    updated: string;
    published?: string;
    scheduled?: string;
  };
  analytics?: {
    estimatedReadTime: number;
    wordCount: number;
    characterCount: number;
  };
}

export interface CategoryPayload {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface TagPayload {
  id: string;
  name: string;
  slug: string;
}

export interface BlogValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlogAnalytics {
  wordCount: number;
  characterCount: number;
  estimatedReadTime: number;
  seoScore: number;
  readabilityScore: number;
}
