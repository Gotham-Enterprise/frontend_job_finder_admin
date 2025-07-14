/**
 * Blog Creation Payload Types
 * Sample payloads for creating blog posts with all necessary fields
 */

export interface CreateBlogPostPayload {
  // Basic Information
  title: string;
  permalink: string;
  content: string;
  excerpt: string;
  
  // Publishing Options
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  
  // Content Organization
  categories: string[];
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  
  // SEO Settings
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string[];
  canonical?: string;
  
  // Social Media
  socialImage?: {
    url: string;
    alt: string;
  };
  
  // Content Settings
  allowComments: boolean;
  allowPings: boolean;
  
  // Author Information
  authorId?: string;
  
  // Additional Metadata
  customFields?: Record<string, any>;
  readingTime?: number;
  wordCount?: number;
}

export interface UpdateBlogPostPayload extends Partial<CreateBlogPostPayload> {
  id: string;
  lastModified?: string;
}

export interface BlogImageUploadPayload {
  file: File;
  alt?: string;
  caption?: string;
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  };
}

export interface ResizedImageResult {
  original: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
  resized: {
    url: string;
    width: number;
    height: number;
    size: number;
    quality: number;
  };
  thumbnails?: {
    small: { url: string; width: number; height: number; };
    medium: { url: string; width: number; height: number; };
    large: { url: string; width: number; height: number; };
  };
}

// Sample Payload Examples
export const SAMPLE_BLOG_PAYLOADS = {
  draft: {
    title: "Getting Started with React and TypeScript",
    permalink: "getting-started-react-typescript",
    content: `
      <h2>Introduction</h2>
      <p>React and TypeScript make a powerful combination for building robust web applications. In this comprehensive guide, we'll explore how to set up and work with both technologies.</p>
      
      <h3>Why TypeScript with React?</h3>
      <p>TypeScript provides several benefits when working with React:</p>
      <ul>
        <li>Type safety and better developer experience</li>
        <li>Better IDE support with autocompletion</li>
        <li>Easier refactoring and maintenance</li>
        <li>Catch errors at compile time</li>
      </ul>
      
      <h3>Setting Up the Project</h3>
      <p>Let's start by creating a new React TypeScript project:</p>
      <pre><code>npx create-react-app my-app --template typescript</code></pre>
      
      <h3>Example Component</h3>
      <p>Here's a simple TypeScript React component:</p>
      <pre><code>
interface UserProps {
  name: string;
  age: number;
  email: string;
}

const UserCard: React.FC<UserProps> = ({ name, age, email }) => {
  return (
    &lt;div className="user-card"&gt;
      &lt;h3&gt;{name}&lt;/h3&gt;
      &lt;p&gt;Age: {age}&lt;/p&gt;
      &lt;p&gt;Email: {email}&lt;/p&gt;
    &lt;/div&gt;
  );
};
      </code></pre>
      
      <p>This example demonstrates proper TypeScript interfaces and component typing.</p>
    `,
    excerpt: "Learn how to combine React and TypeScript for building type-safe, robust web applications with better developer experience.",
    status: "draft" as const,
    visibility: "public" as const,
    publishDate: new Date().toISOString().split('T')[0],
    categories: ["technology", "frontend", "development"],
    tags: ["react", "typescript", "javascript", "web-development", "tutorial"],
    featuredImage: {
      url: "/images/blog/react-typescript-cover.jpg",
      alt: "React and TypeScript logos side by side",
      caption: "React and TypeScript: A powerful combination"
    },
    allowComments: true,
    allowPings: true,
    seoTitle: "React TypeScript Tutorial - Complete Guide for Beginners",
    seoDescription: "Complete guide to using React with TypeScript. Learn setup, components, props, hooks, and best practices for type-safe React development.",
    seoKeywords: ["react", "typescript", "tutorial", "frontend", "web development"],
    readingTime: 8,
    wordCount: 1250
  },

  published: {
    title: "10 Essential VS Code Extensions for Web Developers",
    permalink: "essential-vscode-extensions-web-developers",
    content: `
      <h2>Boost Your Productivity with These Must-Have Extensions</h2>
      <p>Visual Studio Code has become the go-to editor for web developers worldwide. Its extensibility is one of its greatest strengths. Here are 10 essential extensions that will supercharge your development workflow.</p>
      
      <h3>1. Prettier - Code Formatter</h3>
      <p>Prettier automatically formats your code according to consistent rules, ensuring your codebase maintains a clean, readable style.</p>
      
      <h3>2. ESLint</h3>
      <p>ESLint helps identify and fix problems in your JavaScript/TypeScript code, improving code quality and catching bugs early.</p>
      
      <h3>3. Auto Rename Tag</h3>
      <p>Automatically rename paired HTML/XML tags when you modify one of them - a huge time saver for markup editing.</p>
      
      <h3>4. GitLens</h3>
      <p>Supercharge Git capabilities in VS Code with blame annotations, repository insights, and powerful comparison tools.</p>
      
      <h3>5. Live Server</h3>
      <p>Launch a local development server with live reload feature for static and dynamic pages.</p>
      
      <h3>Conclusion</h3>
      <p>These extensions will significantly improve your development experience and productivity. Install them and customize VS Code to fit your workflow perfectly.</p>
    `,
    excerpt: "Discover the top 10 VS Code extensions that every web developer should have installed to boost productivity and improve code quality.",
    status: "published" as const,
    visibility: "public" as const,
    publishDate: "2024-01-15",
    categories: ["tools", "productivity", "development"],
    tags: ["vscode", "extensions", "productivity", "tools", "ide"],
    featuredImage: {
      url: "/images/blog/vscode-extensions.jpg",
      alt: "VS Code interface with extension panel open",
      caption: "Essential VS Code extensions for developers"
    },
    allowComments: true,
    allowPings: true,
    seoTitle: "10 Essential VS Code Extensions Every Web Developer Needs in 2024",
    seoDescription: "Boost your coding productivity with these 10 must-have VS Code extensions. From code formatting to Git integration, discover tools that will transform your development workflow.",
    seoKeywords: ["vscode", "extensions", "web development", "productivity", "coding tools"],
    socialImage: {
      url: "/images/blog/vscode-social.jpg",
      alt: "VS Code Extensions for Web Developers"
    },
    readingTime: 5,
    wordCount: 850
  },

  withImages: {
    title: "Complete Guide to Responsive Web Design",
    permalink: "complete-guide-responsive-web-design",
    content: `
      <h2>Master the Art of Responsive Design</h2>
      <p>Responsive web design ensures your website looks and functions perfectly across all devices. This comprehensive guide covers everything you need to know.</p>
      
      <img src="/images/blog/responsive-devices.jpg" alt="Multiple devices showing responsive website" class="max-w-full h-auto rounded-lg" />
      
      <h3>Understanding Breakpoints</h3>
      <p>Breakpoints are the foundation of responsive design. Here are the most commonly used breakpoints:</p>
      
      <ul>
        <li><strong>Mobile:</strong> 320px - 768px</li>
        <li><strong>Tablet:</strong> 768px - 1024px</li>
        <li><strong>Desktop:</strong> 1024px and above</li>
      </ul>
      
      <h3>CSS Grid vs Flexbox</h3>
      <p>Both CSS Grid and Flexbox are powerful layout tools for responsive design:</p>
      
      <img src="/images/blog/css-grid-flexbox.jpg" alt="CSS Grid and Flexbox comparison" class="max-w-full h-auto rounded-lg" />
      
      <h3>Mobile-First Approach</h3>
      <p>Always start designing for mobile devices first, then progressively enhance for larger screens.</p>
      
      <h3>Testing Your Responsive Design</h3>
      <p>Use browser developer tools and real devices to test your responsive layouts thoroughly.</p>
    `,
    excerpt: "Learn the complete guide to responsive web design including breakpoints, CSS Grid, Flexbox, and mobile-first approach for modern websites.",
    status: "published" as const,
    visibility: "public" as const,
    publishDate: "2024-01-20",
    categories: ["css", "design", "frontend"],
    tags: ["responsive-design", "css", "mobile-first", "grid", "flexbox"],
    featuredImage: {
      url: "/images/blog/responsive-design-hero.jpg",
      alt: "Responsive design concept showing multiple screen sizes",
      caption: "Responsive design adapts to all screen sizes"
    },
    allowComments: true,
    allowPings: true,
    seoTitle: "Complete Responsive Web Design Guide 2024 - CSS Grid, Flexbox & Mobile-First",
    seoDescription: "Master responsive web design with this complete guide. Learn CSS Grid, Flexbox, breakpoints, and mobile-first approach for creating websites that work on all devices.",
    seoKeywords: ["responsive design", "css grid", "flexbox", "mobile first", "web design"],
    readingTime: 12,
    wordCount: 2100
  }
};
