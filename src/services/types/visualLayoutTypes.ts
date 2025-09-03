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
  | 'embed'
  | 'button';

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
  accentColor?: string;
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

export interface ButtonBlock extends LayoutBlock {
  type: 'button';
  content: {
    text: string;
    url?: string;
    target?: '_self' | '_blank';
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
    size: 'small' | 'medium' | 'large';
    icon?: string;
    iconPosition?: 'left' | 'right';
    width: 'auto' | 'full' | 'custom';
    customWidth?: number;
    alignment: 'left' | 'center' | 'right';
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
      level: 1, 
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
      items: ['Item 1', 'Item 2', 'Item 3'],
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
  
  button: {
    type: 'button',
    content: {
      text: 'Click Me',
      url: '',
      target: '_self',
      variant: 'primary',
      size: 'medium',
      icon: '',
      iconPosition: 'left',
      width: 'auto',
      customWidth: 200,
      alignment: 'left',
    },
    styles: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      fontSize: '1rem',
      fontWeight: '500',
      textAlign: 'center',
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      border: { width: 0, style: 'solid', color: 'transparent', radius: 6 },
    },
    position: { x: 0, y: 0, width: 100, height: 48 },
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
  
  // Helper function to create comprehensive inline styles from block styles with !important declarations
  const createInlineStyles = (styles: any, blockType: string) => {
    if (!styles) return '';
    
    const cssProperties: string[] = [];
    
    // Margin with !important
    if (styles.margin) {
      cssProperties.push(`margin: ${styles.margin.top}px ${styles.margin.right}px ${styles.margin.bottom}px ${styles.margin.left}px !important`);
    }
    
    // Padding with !important
    if (styles.padding) {
      cssProperties.push(`padding: ${styles.padding.top}px ${styles.padding.right}px ${styles.padding.bottom}px ${styles.padding.left}px !important`);
    }
    
    // Typography with !important
    if (styles.fontSize) cssProperties.push(`font-size: ${styles.fontSize} !important`);
    if (styles.fontWeight) cssProperties.push(`font-weight: ${styles.fontWeight} !important`);
    if (styles.fontStyle) cssProperties.push(`font-style: ${styles.fontStyle} !important`);
    if (styles.lineHeight) cssProperties.push(`line-height: ${styles.lineHeight} !important`);
    if (styles.letterSpacing) cssProperties.push(`letter-spacing: ${styles.letterSpacing} !important`);
    if (styles.textDecoration) cssProperties.push(`text-decoration: ${styles.textDecoration} !important`);
    
    // Colors with !important
    if (styles.textColor) cssProperties.push(`color: ${styles.textColor} !important`);
    if (styles.backgroundColor) cssProperties.push(`background-color: ${styles.backgroundColor} !important`);
    if (styles.accentColor) cssProperties.push(`accent-color: ${styles.accentColor} !important`);
    
    // Alignment - handle special alignment properties for different block types with !important
    if (blockType === 'image' && styles.imageAlign) {
      cssProperties.push(`text-align: ${styles.imageAlign} !important`);
      if (styles.imageAlign === 'center') {
        cssProperties.push(`display: block !important`);
        cssProperties.push(`margin-left: auto !important`);
        cssProperties.push(`margin-right: auto !important`);
      }
    } else if (blockType === 'video' && styles.videoAlign) {
      cssProperties.push(`text-align: ${styles.videoAlign} !important`);
      if (styles.videoAlign === 'center') {
        cssProperties.push(`display: block !important`);
        cssProperties.push(`margin-left: auto !important`);
        cssProperties.push(`margin-right: auto !important`);
      }
    } else if (styles.textAlign) {
      cssProperties.push(`text-align: ${styles.textAlign} !important`);
    }
    
    // Dimensions with !important
    if (styles.width && styles.widthUnit) {
      cssProperties.push(`width: ${styles.width}${styles.widthUnit} !important`);
    }
    if (styles.height && styles.heightUnit) {
      cssProperties.push(`height: ${styles.height}${styles.heightUnit} !important`);
    }
    
    // Border with !important
    if (styles.border) {
      const border = styles.border;
      if (border.width && border.width > 0) {
        cssProperties.push(`border: ${border.width}px ${border.style || 'solid'} ${border.color || '#e5e7eb'} !important`);
      }
      if (border.radius) {
        cssProperties.push(`border-radius: ${border.radius}px !important`);
      }
    }
    
    // Box shadow with !important
    if (styles.boxShadow) {
      const shadow = styles.boxShadow;
      cssProperties.push(`box-shadow: ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color} !important`);
    }
    
    // Opacity with !important
    if (styles.opacity !== undefined) {
      cssProperties.push(`opacity: ${styles.opacity} !important`);
    }
    
    // Transform with !important
    if (styles.transform) {
      const transform = styles.transform;
      const transformProps = [];
      if (transform.scale !== undefined) transformProps.push(`scale(${transform.scale})`);
      if (transform.rotate !== undefined) transformProps.push(`rotate(${transform.rotate}deg)`);
      if (transformProps.length > 0) {
        cssProperties.push(`transform: ${transformProps.join(' ')} !important`);
      }
    }
    
    return cssProperties.length > 0 ? ` style="${cssProperties.join('; ')}"` : '';
  };

  // Helper function to create unique CSS classes for complex styling (similar to EditorJS renderer)
  const createUniqueCss = (styles: any, blockType: string, index: number) => {
    if (!styles) return { cssClass: '', cssStyle: '' };
    
    const uniqueId = `${blockType}-${index}-${Date.now()}`;
    const cssProperties: string[] = [];
    
    // Add all styles with !important
    if (styles.fontSize) cssProperties.push(`font-size: ${styles.fontSize} !important`);
    if (styles.fontWeight) cssProperties.push(`font-weight: ${styles.fontWeight} !important`);
    if (styles.fontStyle) cssProperties.push(`font-style: ${styles.fontStyle} !important`);
    if (styles.textAlign) cssProperties.push(`text-align: ${styles.textAlign} !important`);
    if (styles.textColor) cssProperties.push(`color: ${styles.textColor} !important`);
    if (styles.backgroundColor) cssProperties.push(`background-color: ${styles.backgroundColor} !important`);
    if (styles.textDecoration) cssProperties.push(`text-decoration: ${styles.textDecoration} !important`);
    if (styles.lineHeight) cssProperties.push(`line-height: ${styles.lineHeight} !important`);
    if (styles.letterSpacing) cssProperties.push(`letter-spacing: ${styles.letterSpacing} !important`);
    
    // Margin and padding
    if (styles.margin) {
      cssProperties.push(`margin: ${styles.margin.top}px ${styles.margin.right}px ${styles.margin.bottom}px ${styles.margin.left}px !important`);
    }
    if (styles.padding) {
      cssProperties.push(`padding: ${styles.padding.top}px ${styles.padding.right}px ${styles.padding.bottom}px ${styles.padding.left}px !important`);
    }
    
    // Dimensions
    if (styles.width && styles.widthUnit) {
      cssProperties.push(`width: ${styles.width}${styles.widthUnit} !important`);
    }
    if (styles.height && styles.heightUnit) {
      cssProperties.push(`height: ${styles.height}${styles.heightUnit} !important`);
    }
    
    // Border
    if (styles.border) {
      const border = styles.border;
      if (border.width && border.width > 0) {
        cssProperties.push(`border: ${border.width}px ${border.style || 'solid'} ${border.color || '#e5e7eb'} !important`);
      }
      if (border.radius) {
        cssProperties.push(`border-radius: ${border.radius}px !important`);
      }
    }
    
    // Special alignment handling
    if (blockType === 'image' && styles.imageAlign === 'center') {
      cssProperties.push(`display: block !important`);
      cssProperties.push(`margin-left: auto !important`);
      cssProperties.push(`margin-right: auto !important`);
    }
    if (blockType === 'video' && styles.videoAlign === 'center') {
      cssProperties.push(`display: block !important`);
      cssProperties.push(`margin-left: auto !important`);
      cssProperties.push(`margin-right: auto !important`);
    }
    
    const cssStyle = cssProperties.length > 0 ? 
      `<style>.${uniqueId} { ${cssProperties.join('; ')} }</style>` : '';
    
    return { cssClass: uniqueId, cssStyle };
  };

  return layout.blocks.map((block, index) => {
    switch (block.type) {
      case 'heading':
        const headingBlock = block as HeadingBlock;
        const headingText = headingBlock.content.text === 'Your Heading Here' 
          ? 'Your Heading Here' 
          : headingBlock.content.text;
        const { cssClass: headingClass, cssStyle: headingStyle } = createUniqueCss(block.styles, 'heading', index);
        return `${headingStyle}<h${headingBlock.content.level} class="${headingClass}">${headingText}</h${headingBlock.content.level}>`;
      
      case 'paragraph':
        const paragraphBlock = block as ParagraphBlock;
        const paragraphText = paragraphBlock.content.text === 'Start writing your content here...' 
          ? 'Start writing your content here...' 
          : paragraphBlock.content.text;
        const { cssClass: paragraphClass, cssStyle: paragraphStyle } = createUniqueCss(block.styles, 'paragraph', index);
        return `${paragraphStyle}<p class="${paragraphClass}">${paragraphText}</p>`;
      
      case 'image':
        const imageBlock = block as ImageBlock;
        const { cssClass: imageClass, cssStyle: imageStyle } = createUniqueCss(block.styles, 'image', index);
        const { cssClass: imgClass, cssStyle: imgStyle } = createUniqueCss({
          ...block.styles,
          display: 'block',
          maxWidth: '100%'
        }, 'img', index + 1000);
        
        const imageContainerAlign = block.styles?.imageAlign === 'center' ? 'text-center' : 
                              block.styles?.imageAlign === 'right' ? 'text-right' : 'text-left';
          
        return `${imageStyle}${imgStyle}<figure class="${imageClass} ${imageContainerAlign}">
          <img src="${imageBlock.content.url}" alt="${imageBlock.content.alt}" class="${imgClass}" />
          ${imageBlock.content.caption ? `<figcaption style="text-align: center !important; font-size: 0.875rem !important; color: #6b7280 !important; margin-top: 12px !important; font-style: italic !important;">${imageBlock.content.caption}</figcaption>` : ''}
        </figure>`;
      
      case 'quote':
        const quoteBlock = block as QuoteBlock;
        const { cssClass: quoteClass, cssStyle: quoteStyle } = createUniqueCss({
          ...block.styles,
          borderLeft: '4px solid ' + (block.styles?.accentColor || '#3b82f6')
        }, 'quote', index);
        return `${quoteStyle}<blockquote class="${quoteClass}">
          <p style="margin-bottom: 8px !important;">${quoteBlock.content.text}</p>
          ${quoteBlock.content.author ? `<cite style="font-size: 0.875rem !important; font-style: normal !important; font-weight: 500 !important; opacity: 0.8 !important;">— ${quoteBlock.content.author}${quoteBlock.content.source ? `, ${quoteBlock.content.source}` : ''}</cite>` : ''}
        </blockquote>`;
      
      case 'list':
        const listBlock = block as ListBlock;
        const listTag = listBlock.content.ordered ? 'ol' : 'ul';
        const { cssClass: listClass, cssStyle: listStyle } = createUniqueCss(block.styles, 'list', index);
        const listItems = listBlock.content.items
          .map((item, itemIndex) => {
            const isPlaceholder = item.trim() === '' || (item.startsWith('Item ') && /^Item \d+$/.test(item));
            const displayText = isPlaceholder ? `Item ${itemIndex + 1}` : item;
            return `<li style="margin-bottom: 8px !important;">${displayText}</li>`;
          })
          .join('');
        const listTypeStyle = listBlock.content.ordered ? 
          'list-style-type: decimal !important; padding-left: 24px !important;' : 
          'list-style-type: disc !important; padding-left: 24px !important;';
        return `${listStyle}<${listTag} class="${listClass}" style="${listTypeStyle}">${listItems}</${listTag}>`;
      
      case 'code':
        const codeBlock = block as CodeBlock;
        const { cssClass: codeClass, cssStyle: codeStyle } = createUniqueCss({
          ...block.styles,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          whiteSpace: 'pre',
          overflowX: 'auto'
        }, 'code', index);
        return `${codeStyle}<pre class="${codeClass}"><code>${codeBlock.content.code}</code></pre>`;
      
      case 'spacer':
        const { cssClass: spacerClass, cssStyle: spacerStyle } = createUniqueCss(block.styles, 'spacer', index);
        return `${spacerStyle}<div class="${spacerClass} spacer"></div>`;
      
      case 'hero':
        const heroBlock = block as HeroBlock;
        const { cssClass: heroClass, cssStyle: heroStyle } = createUniqueCss(block.styles, 'hero', index);
        const backgroundStyle = heroBlock.content.backgroundUrl 
          ? ` style="background-image: url(${heroBlock.content.backgroundUrl}) !important; background-size: cover !important; background-position: center !important;"` 
          : '';
        return `${heroStyle}<section class="${heroClass} hero-section"${backgroundStyle}>
          ${heroBlock.content.overlay ? `<div style="position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background-color: ${heroBlock.content.overlay.color} !important; opacity: ${heroBlock.content.overlay.opacity} !important;"></div>` : ''}
          <div style="position: relative !important; z-index: 1 !important;">
            <h1 style="font-size: 2.5rem !important; font-weight: bold !important; margin-bottom: 16px !important;">${heroBlock.content.title}</h1>
            ${heroBlock.content.subtitle ? `<p style="font-size: 1.25rem !important; margin-bottom: 24px !important;">${heroBlock.content.subtitle}</p>` : ''}
            ${heroBlock.content.ctaButton ? `<a href="${heroBlock.content.ctaButton.url}" style="display: inline-block !important; padding: 12px 24px !important; background-color: #3b82f6 !important; color: white !important; text-decoration: none !important; border-radius: 6px !important; font-weight: 500 !important;">${heroBlock.content.ctaButton.text}</a>` : ''}
          </div>
        </section>`;
      
      case 'gallery':
        const galleryBlock = block as GalleryBlock;
        const { cssClass: galleryClass, cssStyle: galleryStyle } = createUniqueCss(block.styles, 'gallery', index);
        const galleryImages = galleryBlock.content.images.map((img, imgIndex) => 
          `<figure style="margin: 8px !important;">
            <img src="${img.url}" alt="${img.alt}" style="width: 100% !important; height: auto !important; border-radius: 4px !important;" />
            ${img.caption ? `<figcaption style="text-align: center !important; font-size: 0.875rem !important; color: #6b7280 !important; margin-top: 8px !important;">${img.caption}</figcaption>` : ''}
          </figure>`
        ).join('');
        const gridStyles = `display: grid !important; grid-template-columns: repeat(${galleryBlock.content.columns}, 1fr) !important; gap: 16px !important;`;
        return `${galleryStyle}<div class="${galleryClass}" style="${gridStyles}">
          ${galleryImages}
        </div>`;
      
      case 'embed':
        const embedBlock = block as EmbedBlock;
        const { cssClass: embedClass, cssStyle: embedStyle } = createUniqueCss(block.styles, 'embed', index);
        return `${embedStyle}<div class="${embedClass}" style="margin-bottom: 24px !important;">
          ${embedBlock.content.embedCode}
        </div>`;
      
      case 'button':
        const buttonBlock = block as ButtonBlock;
        const alignment = buttonBlock.content.alignment || 'left';
        const width = buttonBlock.content.width || 'auto';
        const customWidth = buttonBlock.content.customWidth || 200;
        
        const { cssClass: buttonClass, cssStyle: buttonStyle } = createUniqueCss({
          ...block.styles,
          display: width === 'full' ? 'block' : 'inline-block',
          width: width === 'full' ? '100%' : width === 'custom' ? `${customWidth}px` : 'auto',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }, 'button', index);
        
        const containerStyle = `text-align: ${alignment} !important; margin-bottom: 16px !important;`;
        
        const buttonElement = buttonBlock.content.url ? 
          `<a href="${buttonBlock.content.url}" target="${buttonBlock.content.target || '_self'}"${buttonBlock.content.target === '_blank' ? ' rel="noopener noreferrer"' : ''} class="${buttonClass}">${buttonBlock.content.text}</a>` :
          `<button class="${buttonClass}">${buttonBlock.content.text}</button>`;
        
        return `${buttonStyle}<div style="${containerStyle}">${buttonElement}</div>`;
      
      case 'video':
        const videoBlock = block as VideoBlock;
        const { cssClass: videoClass, cssStyle: videoStyle } = createUniqueCss(block.styles, 'video', index);
        
        // Check if it's a YouTube URL and convert to embed
        const videoUrl = videoBlock.content.url;
        let embedHtml = '';
        
        const videoContainerAlign = block.styles?.videoAlign === 'center' ? 'text-center' : 
                              block.styles?.videoAlign === 'right' ? 'text-right' : 'text-left';
        
        // Video/iframe specific styles with !important
        const mediaStyles = `width: 100% !important; aspect-ratio: 16/9 !important; border-radius: 8px !important; ${
          block.styles?.videoAlign === 'center' ? 'margin-left: auto !important; margin-right: auto !important; display: block !important;' : ''
        }`;
        
        if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
          // Extract video ID and create YouTube embed
          const videoId = videoUrl.includes('youtube.com/watch') 
            ? videoUrl.split('v=')[1]?.split('&')[0]
            : videoUrl.split('youtu.be/')[1]?.split('?')[0];
            
          if (videoId) {
            embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" 
              title="${videoBlock.content.title || 'Video'}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              style="${mediaStyles}">
            </iframe>`;
          }
        } else if (videoUrl.startsWith('http')) {
          // For direct video URLs
          embedHtml = `<video 
            ${videoBlock.content.controls ? 'controls' : ''} 
            ${videoBlock.content.autoplay ? 'autoplay' : ''} 
            ${videoBlock.content.muted ? 'muted' : ''} 
            style="${mediaStyles}">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
        }
        
        return `${videoStyle}<figure class="${videoClass} ${videoContainerAlign}">
          ${embedHtml}
          ${videoBlock.content.title ? `<figcaption style="text-align: center !important; font-size: 0.875rem !important; color: #6b7280 !important; margin-top: 12px !important; font-style: italic !important;">${videoBlock.content.title}</figcaption>` : ''}
        </figure>`;
      
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
