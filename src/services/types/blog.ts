export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: string;
  visibility?: 'public' | 'private' | 'password';
  publishedDate?: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  featuredImage?: {
    url: string;
    alt: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  analytics: {
    seoScore: number;
    wordCount: number;
    characterCount: number;
    readabilityScore: number;
    estimatedReadTime: number;
  };
  commentCount?: number;
  viewCount?: number;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
  author?: string;
  sortBy?: 'title' | 'publishedDate' | 'createdAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogPostsResponse {
  success: boolean;
  data: BlogPost[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalComments: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  postCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
}
