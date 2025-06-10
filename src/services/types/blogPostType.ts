export interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  allowComments: boolean;
  allowPings: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CategoryOption {
  value: string;
  text: string;
  selected: boolean;
}

export interface TagOption {
  value: string;
  text: string;
  selected: boolean;
}
