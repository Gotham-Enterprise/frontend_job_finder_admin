export interface BlogPost {
  title: string;
  permalink: string;
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

export interface TemplateBlock {
  id: string;
  type: 'image' | 'text' | 'heading' | 'list' | 'quote';
  content: string;
  placeholder?: string;
  props?: {
    level?: number; 
    alignment?: 'left' | 'center' | 'right';
    style?: 'disc' | 'decimal'; 
  };
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  blocks: TemplateBlock[];
  category: 'layout' | 'content' | 'mixed';
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  templates: ContentTemplate[];
}
