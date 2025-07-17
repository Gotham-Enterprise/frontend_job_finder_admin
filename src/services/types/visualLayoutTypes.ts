export type BlockType = 
  | 'heading' 
  | 'paragraph' 
  | 'image' 
  | 'video'
  | 'quote' 
  | 'list' 
  | 'code' 
  | 'spacer'
  | 'hero'
  | 'gallery'
  | 'embed';

export interface LayoutBlock {
  id: string;
  type: BlockType;
  content: any;
  styles: BlockStyles;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  children?: LayoutBlock[];
  metadata?: {
    created: string;
    updated: string;
  };
}

export interface BlockStyles {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: string;
  lineHeight?: string;
  imageAlign?: 'left' | 'center' | 'right';
  videoAlign?: 'left' | 'center' | 'right';
  titleFontSize?: string;
  subtitleFontSize?: string;
  width?: number;
  height?: number;
  widthUnit?: 'px' | '%';
  heightUnit?: 'px' | '%';
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  border?: {
    width: number;
    style: string;
    color: string;
    radius: number;
  };
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  opacity?: number;
  boxShadow?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  transform?: {
    scale: number;
    rotate: number;
  };
}

export interface HeadingBlock extends LayoutBlock {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ParagraphBlock extends LayoutBlock {
  type: 'paragraph';
  content: {
    text: string;
    richText?: boolean;
  };
}

export interface ImageBlock extends LayoutBlock {
  type: 'image';
  content: {
    url: string;
    alt: string;
    caption?: string;
    size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
    aspectRatio?: string;
  };
}

export interface VideoBlock extends LayoutBlock {
  type: 'video';
  content: {
    url: string;
    title?: string;
    caption?: string;
    aspectRatio?: string;
    autoplay?: boolean;
    controls?: boolean;
    muted?: boolean;
    provider?: 'youtube' | 'vimeo' | 'direct' | 'other';
  };
}

export interface QuoteBlock extends LayoutBlock {
  type: 'quote';
  content: {
    text: string;
    author?: string;
    source?: string;
  };
}

export interface ListBlock extends LayoutBlock {
  type: 'list';
  content: {
    items: string[];
    ordered: boolean;
  };
}

export interface CodeBlock extends LayoutBlock {
  type: 'code';
  content: {
    code: string;
    language: string;
    showLineNumbers?: boolean;
  };
}

export interface HeroBlock extends LayoutBlock {
  type: 'hero';
  content: {
    title: string;
    subtitle?: string;
    backgroundUrl?: string;
    overlay?: {
      color: string;
      opacity: number;
    };
    ctaButton?: {
      text: string;
      url: string;
      style: 'primary' | 'secondary' | 'outline';
    };
  };
}

export interface GalleryBlock extends LayoutBlock {
  type: 'gallery';
  content: {
    images: Array<{
      url: string;
      alt: string;
      caption?: string;
    }>;
    layout: 'grid' | 'masonry' | 'carousel';
    columns: number;
  };
}

export interface EmbedBlock extends LayoutBlock {
  type: 'embed';
  content: {
    embedCode: string;
    provider?: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'custom';
    url?: string;
  };
}

export interface BlogLayout {
  id: string;
  name: string;
  blocks: LayoutBlock[];
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

export const BLOCK_TEMPLATES: Record<BlockType, Partial<LayoutBlock>> = {
  heading: {
    type: 'heading',
    content: {
      text: 'Your Heading Here',
      level: 2,
    },
    styles: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'left',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 32, right: 0, bottom: 16, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 60 },
  },
  
  paragraph: {
    type: 'paragraph',
    content: {
      text: 'Start writing your content here...',
      richText: true,
    },
    styles: {
      fontSize: '1rem',
      textAlign: 'left',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 80 },
  },
  
  image: {
    type: 'image',
    content: {
      url: '',
      alt: 'Image description',
      size: 'medium',
      aspectRatio: '16:9',
    },
    styles: {
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 24, right: 0, bottom: 24, left: 0 },
      border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 8 },
      width: 100,
      height: 400,
      widthUnit: '%',
      heightUnit: 'px',
      imageAlign: 'center',
    },
    position: { x: 0, y: 0, width: 100, height: 200 },
  },
  
  video: {
    type: 'video',
    content: {
      url: '',
      title: 'Video title',
      aspectRatio: '16:9',
      autoplay: false,
      controls: true,
      muted: false,
    },
    styles: {
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 24, right: 0, bottom: 24, left: 0 },
      border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 8 },
      width: 100,
      height: 400,
      widthUnit: '%',
      heightUnit: 'px',
      videoAlign: 'center',
    },
    position: { x: 0, y: 0, width: 100, height: 200 },
  },
  
  quote: {
    type: 'quote',
    content: {
      text: 'Your inspiring quote goes here...',
      author: 'Author Name',
    },
    styles: {
      fontSize: '1.25rem',
      textAlign: 'center',
      padding: { top: 24, right: 32, bottom: 24, left: 32 },
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
      backgroundColor: '#f9fafb',
      border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 8 },
    },
    position: { x: 0, y: 0, width: 100, height: 120 },
  },
  
  list: {
    type: 'list',
    content: {
      items: ['First item', 'Second item', 'Third item'],
      ordered: false,
    },
    styles: {
      padding: { top: 8, right: 0, bottom: 8, left: 24 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 100 },
  },
  
  code: {
    type: 'code',
    content: {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      showLineNumbers: true,
    },
    styles: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      fontSize: '0.875rem',
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      border: { width: 0, style: 'solid', color: '#374151', radius: 6 },
    },
    position: { x: 0, y: 0, width: 100, height: 120 },
  },
  
  spacer: {
    type: 'spacer',
    content: {},
    styles: {
      backgroundColor: 'transparent',
    },
    position: { x: 0, y: 0, width: 100, height: 40 },
  },
  
  hero: {
    type: 'hero',
    content: {
      title: 'Welcome to Our Blog',
      subtitle: 'Discover amazing content and insights',
      overlay: { color: '#000000', opacity: 0.4 },
      ctaButton: {
        text: 'Get Started',
        url: '#',
        style: 'primary',
      },
    },
    styles: {
      textAlign: 'center',
      textColor: '#ffffff',
      padding: { top: 80, right: 32, bottom: 80, left: 32 },
      margin: { top: 0, right: 0, bottom: 32, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 400 },
  },
  
  gallery: {
    type: 'gallery',
    content: {
      images: [],
      layout: 'grid',
      columns: 3,
    },
    styles: {
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 300 },
  },
  
  embed: {
    type: 'embed',
    content: {
      embedCode: '',
      provider: 'custom',
    },
    styles: {
      padding: { top: 16, right: 0, bottom: 16, left: 0 },
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 200 },
  },
};


export const LAYOUT_PRESETS = {
  blog_post: {
    name: 'Standard Blog Post',
    blocks: [
      { ...BLOCK_TEMPLATES.hero, id: 'hero-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'intro-1' },
      { ...BLOCK_TEMPLATES.image, id: 'image-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'content-1' },
      { ...BLOCK_TEMPLATES.quote, id: 'quote-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'content-2' },
    ],
  },
  
  tutorial: {
    name: 'Tutorial Layout',
    blocks: [
      { ...BLOCK_TEMPLATES.heading, id: 'title-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'intro-1' },
      { ...BLOCK_TEMPLATES.list, id: 'steps-1' },
      { ...BLOCK_TEMPLATES.code, id: 'code-1' },
      { ...BLOCK_TEMPLATES.image, id: 'demo-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'conclusion-1' },
    ],
  },
  
  gallery_showcase: {
    name: 'Gallery Showcase',
    blocks: [
      { ...BLOCK_TEMPLATES.hero, id: 'hero-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'intro-1' },
      { ...BLOCK_TEMPLATES.gallery, id: 'gallery-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'description-1' },
    ],
  },
  
  interview: {
    name: 'Interview Format',
    blocks: [
      { ...BLOCK_TEMPLATES.heading, id: 'title-1' },
      { ...BLOCK_TEMPLATES.image, id: 'profile-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'intro-1' },
      { ...BLOCK_TEMPLATES.quote, id: 'quote-1' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'response-1' },
      { ...BLOCK_TEMPLATES.quote, id: 'quote-2' },
      { ...BLOCK_TEMPLATES.paragraph, id: 'response-2' },
    ],
  },
};


export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createBlock = (type: BlockType, overrides?: Partial<LayoutBlock>): LayoutBlock => {
  const template = BLOCK_TEMPLATES[type];
  return {
    id: generateBlockId(),
    ...template,
    ...overrides,
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  } as LayoutBlock;
};

export const duplicateBlock = (block: LayoutBlock): LayoutBlock => {
  return {
    ...block,
    id: generateBlockId(),
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
};

export const updateBlockContent = (block: LayoutBlock, content: any): LayoutBlock => {
  return {
    ...block,
    content: { ...block.content, ...content },
    metadata: {
      created: block.metadata?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
};

export const updateBlockStyles = (block: LayoutBlock, styles: Partial<BlockStyles>): LayoutBlock => {
  return {
    ...block,
    styles: { ...block.styles, ...styles },
    metadata: {
      created: block.metadata?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
};

export const convertLayoutToHtml = (layout: BlogLayout): string => {
  return layout.blocks.map(block => {
    const baseStyles = block.styles ? {
      padding: block.styles.padding ? `${block.styles.padding.top}px ${block.styles.padding.right}px ${block.styles.padding.bottom}px ${block.styles.padding.left}px` : '',
      margin: block.styles.margin ? `${block.styles.margin.top}px ${block.styles.margin.right}px ${block.styles.margin.bottom}px ${block.styles.margin.left}px` : '',
      backgroundColor: block.styles.backgroundColor || '',
      color: block.styles.textColor || '',
      fontSize: block.styles.fontSize || '',
      fontWeight: block.styles.fontWeight || '',
      textAlign: block.styles.textAlign || '',
    } : {};

    const styleString = Object.entries(baseStyles)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    const styleAttr = styleString ? ` style="${styleString}"` : '';

    switch (block.type) {
      case 'heading':
        const headingBlock = block as HeadingBlock;
        return `<h${headingBlock.content.level}${styleAttr}>${headingBlock.content.text}</h${headingBlock.content.level}>`;
      
      case 'paragraph':
        const paragraphBlock = block as ParagraphBlock;
        return `<p${styleAttr}>${paragraphBlock.content.text}</p>`;
      
      case 'image':
        const imageBlock = block as ImageBlock;
        return `<figure${styleAttr}>
          <img src="${imageBlock.content.url}" alt="${imageBlock.content.alt}" />
          ${imageBlock.content.caption ? `<figcaption>${imageBlock.content.caption}</figcaption>` : ''}
        </figure>`;
      
      case 'quote':
        const quoteBlock = block as QuoteBlock;
        return `<blockquote${styleAttr}>
          <p>${quoteBlock.content.text}</p>
          ${quoteBlock.content.author ? `<cite>— ${quoteBlock.content.author}${quoteBlock.content.source ? `, ${quoteBlock.content.source}` : ''}</cite>` : ''}
        </blockquote>`;
      
      case 'list':
        const listBlock = block as ListBlock;
        const listTag = listBlock.content.ordered ? 'ol' : 'ul';
        const listItems = listBlock.content.items.map(item => `<li>${item}</li>`).join('');
        return `<${listTag}${styleAttr}>${listItems}</${listTag}>`;
      
      case 'code':
        const codeBlock = block as CodeBlock;
        return `<pre${styleAttr}><code class="language-${codeBlock.content.language}">${codeBlock.content.code}</code></pre>`;
      
      case 'spacer':
        return `<div${styleAttr} class="spacer"></div>`;
      
      case 'hero':
        const heroBlock = block as HeroBlock;
        return `<section${styleAttr} class="hero-section" ${heroBlock.content.backgroundUrl ? `style="background-image: url(${heroBlock.content.backgroundUrl}); background-size: cover; background-position: center;"` : ''}>
          ${heroBlock.content.overlay ? `<div class="hero-overlay" style="background-color: ${heroBlock.content.overlay.color}; opacity: ${heroBlock.content.overlay.opacity};"></div>` : ''}
          <div class="hero-content">
            <h1>${heroBlock.content.title}</h1>
            ${heroBlock.content.subtitle ? `<p class="hero-subtitle">${heroBlock.content.subtitle}</p>` : ''}
            ${heroBlock.content.ctaButton ? `<a href="${heroBlock.content.ctaButton.url}" class="btn btn-${heroBlock.content.ctaButton.style}">${heroBlock.content.ctaButton.text}</a>` : ''}
          </div>
        </section>`;
      
      case 'gallery':
        const galleryBlock = block as GalleryBlock;
        const galleryImages = galleryBlock.content.images.map(img => 
          `<figure class="gallery-item">
            <img src="${img.url}" alt="${img.alt}" />
            ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
          </figure>`
        ).join('');
        return `<div${styleAttr} class="gallery gallery-${galleryBlock.content.layout}" data-columns="${galleryBlock.content.columns}">
          ${galleryImages}
        </div>`;
      
      case 'embed':
        const embedBlock = block as EmbedBlock;
        return `<div${styleAttr} class="embed-container" data-provider="${embedBlock.content.provider}">
          ${embedBlock.content.embedCode}
        </div>`;
      
      default:
        return `<!-- Unsupported block type: ${block.type} -->`;
    }
  }).join('\n');
};

export const convertLayoutToBlogPayload = (layout: BlogLayout, blogData: any) => {
 
  return {
    ...blogData,
    content: convertLayoutToHtml(layout),
    layout: {
      version: '1.0',
      blocks: layout.blocks,
      settings: layout.settings,
    },
  };
};
