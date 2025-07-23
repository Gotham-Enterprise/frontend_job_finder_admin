export interface BlogLayoutComponent {
  id: string;
  type: 'text' | 'image' | 'heading' | 'quote' | 'code' | 'list' | 'divider' | 'video' | 'gallery';
  position: {
    x: number;
    y: number;
    width: string; 
    height?: string;
  };
  styles: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderRadius?: string;
    border?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  content: any;
  responsive: {
    mobile: Partial<BlogLayoutComponent['position']>;
    tablet: Partial<BlogLayoutComponent['position']>;
    desktop: Partial<BlogLayoutComponent['position']>;
  };
}

export interface TextComponent extends BlogLayoutComponent {
  type: 'text';
  content: {
    text: string;
    html: string;
  };
}

export interface ImageComponent extends BlogLayoutComponent {
  type: 'image';
  content: {
    imageId: string; // Reference to uploaded image
    url?: string; // Temporary URL for preview
    alt: string;
    caption?: string;
    link?: string;
    lazy?: boolean;
  };
}

export interface HeadingComponent extends BlogLayoutComponent {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface QuoteComponent extends BlogLayoutComponent {
  type: 'quote';
  content: {
    text: string;
    author?: string;
    source?: string;
  };
}

export interface GalleryComponent extends BlogLayoutComponent {
  type: 'gallery';
  content: {
    imageIds: string[]; // References to uploaded images
    layout: 'grid' | 'masonry' | 'carousel';
    columns: number;
    spacing: string;
  };
}

export interface BlogLayout {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // Preview image URL
  components: BlogLayoutComponent[];
  settings: {
    maxWidth: string;
    backgroundColor: string;
    fontFamily: string;
    responsive: boolean;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    tags: string[];
  };
}

// Pre-built templates
export interface BlogTemplate {
  id: string;
  name: string;
  description: string;
  category: 'article' | 'tutorial' | 'news' | 'review' | 'portfolio' | 'landing';
  thumbnail: string;
  layout: BlogLayout;
  sampleContent: {
    title: string;
    excerpt: string;
    seoTitle: string;
    seoDescription: string;
    tags: string[];
    categories: string[];
  };
}

// Final blog payload with optimized image handling
export interface VisualBlogPayload {
  // Basic info
  title: string;
  permalink: string;
  excerpt: string;
  
  // Layout data
  layout: BlogLayout;
  
  // Image references (not base64!)
  images: {
    [imageId: string]: {
      filename: string;
      originalSize: number;
      processedSizes: {
        thumbnail: string; // URL or path
        small: string;
        medium: string;
        large: string;
        original: string;
      };
      metadata: {
        width: number;
        height: number;
        format: string;
        alt: string;
        uploadedAt: string;
      };
    };
  };
  
  generatedHtml: string;
  
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'private' | 'password';
  publishDate: string;
  

  seoTitle: string;
  seoDescription: string;
  socialImage?: string; 
  
  categories: string[];
  tags: string[];
  
  allowComments: boolean;
  featuredPost: boolean;

  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: 'modern-article',
    name: 'Modern Article',
    description: 'Clean, professional layout for long-form content',
    category: 'article',
    thumbnail: '/templates/modern-article.jpg',
    layout: {
      id: 'modern-article-layout',
      name: 'Modern Article Layout',
      description: 'Professional article layout with hero image',
      thumbnail: '/templates/modern-article.jpg`',
      components: [
        {
          id: 'hero-image',
          type: 'image',
          position: { x: 0, y: 0, width: '100%', height: '400px' },
          styles: {
            borderRadius: '12px',
            margin: '0 0 2rem 0'
          },
          content: {
            imageId: 'template-hero',
            alt: 'Article hero image',
            lazy: false
          },
          responsive: {
            mobile: { height: '250px' },
            tablet: { height: '300px' },
            desktop: { height: '400px' }
          }
        },
        {
          id: 'main-heading',
          type: 'heading',
          position: { x: 0, y: 420, width: '100%' },
          styles: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            textAlign: 'center'
          },
          content: {
            text: 'Your Article Title Here',
            level: 1
          },
          responsive: {
            mobile: { width: '100%' },
            tablet: { width: '100%' },
            desktop: { width: '100%' }
          }
        },
        {
          id: 'intro-text',
          type: 'text',
          position: { x: 0, y: 500, width: '100%' },
          styles: {
            fontSize: '1.125rem',
            margin: '0 0 2rem 0',
            color: '#6b7280'
          },
          content: {
            text: 'This is your article introduction. Edit this text to match your content.',
            html: '<p>This is your article introduction. Edit this text to match your content.</p>'
          },
          responsive: {
            mobile: {},
            tablet: {},
            desktop: {}
          }
        }
      ],
      settings: {
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        responsive: true
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: ['article', 'professional', 'clean']
      }
    },
    sampleContent: {
      title: '10 Quick Tips About Modern Web Development',
      excerpt: 'Learn essential modern web development techniques that will improve your workflow and code quality.',
      seoTitle: '10 Quick Tips About Modern Web Development - Developer Guide',
      seoDescription: 'Discover 10 essential modern web development tips covering React, TypeScript, performance optimization, and best practices.',
      tags: ['web-development', 'react', 'typescript', 'tips'],
      categories: ['development', 'tutorial']
    }
  },
  {
    id: 'tutorial-step',
    name: 'Tutorial with Steps',
    description: 'Step-by-step tutorial layout with code blocks',
    category: 'tutorial',
    thumbnail: '/templates/tutorial-step.jpg',
    layout: {
      id: 'tutorial-layout',
      name: 'Tutorial Layout',
      description: 'Step-by-step tutorial with code examples',
      thumbnail: '/templates/tutorial-step.jpg',
      components: [
        {
          id: 'tutorial-heading',
          type: 'heading',
          position: { x: 0, y: 0, width: '100%' },
          styles: {
            fontSize: '2.25rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0'
          },
          content: {
            text: 'Step-by-Step Tutorial',
            level: 1
          },
          responsive: {
            mobile: {},
            tablet: {},
            desktop: {}
          }
        },
        {
          id: 'step-1',
          type: 'heading',
          position: { x: 0, y: 80, width: '100%' },
          styles: {
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0'
          },
          content: {
            text: 'Step 1: Getting Started',
            level: 2
          },
          responsive: {
            mobile: {},
            tablet: {},
            desktop: {}
          }
        },
        {
          id: 'step-1-content',
          type: 'text',
          position: { x: 0, y: 140, width: '100%' },
          styles: {
            margin: '0 0 1.5rem 0'
          },
          content: {
            text: 'Explain the first step of your tutorial here.',
            html: '<p>Explain the first step of your tutorial here.</p>'
          },
          responsive: {
            mobile: {},
            tablet: {},
            desktop: {}
          }
        }
      ],
      settings: {
        maxWidth: '900px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        responsive: true
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: ['tutorial', 'step-by-step', 'educational']
      }
    },
    sampleContent: {
      title: 'Complete Guide to React Hooks',
      excerpt: 'Master React Hooks with this comprehensive step-by-step tutorial covering useState, useEffect, and custom hooks.',
      seoTitle: 'Complete React Hooks Guide - Step by Step Tutorial',
      seoDescription: 'Learn React Hooks from basics to advanced concepts. Complete tutorial with examples, best practices, and real-world applications.',
      tags: ['react', 'hooks', 'tutorial', 'javascript'],
      categories: ['development', 'react', 'tutorial']
    }
  }
];
