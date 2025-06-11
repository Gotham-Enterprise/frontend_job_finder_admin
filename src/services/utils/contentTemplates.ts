import { ContentTemplate, TemplateCategory } from "@/services/types/blogPostType";
import { enhanceImageWithClickHandler, createImageClickHandler, templateImageStyles } from "./templateImageHandler";

export const contentTemplates: ContentTemplate[] = [  {
    id: 'image-left-text-right',
    name: 'Image Left, Text Right',
    description: 'Two-column layout with image on the left and text on the right',
    preview: '🖼️ | 📝',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="display: flex; gap: 2rem; align-items: flex-start; margin: 2rem 0; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;" class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder')}
          </div>
          <div style="flex: 1; min-width: 300px;">
            <p>Add your content here. This text will appear to the right of the image. You can include multiple paragraphs, lists, or any other content.</p>
            <p>This layout is perfect for showcasing products, introducing team members, or highlighting key features with supporting visuals.</p>
            <p><strong>Tip:</strong> Click on the image to replace it with your own content.</p>
          </div>
        </div>`,
        placeholder: 'Two-column image and text layout',
      }
    ]
  },  {
    id: 'text-left-image-right',
    name: 'Text Left, Image Right',
    description: 'Two-column layout with text on the left and image on the right',
    preview: '📝 | 🖼️',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="display: flex; gap: 2rem; align-items: flex-start; margin: 2rem 0; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <p>Add your content here. This text will appear to the left of the image. You can include detailed descriptions, explanations, or narratives.</p>
            <p>This layout works well for storytelling, detailed explanations, or when you want the text to be the primary focus with supporting imagery.</p>
            <p><strong>Tip:</strong> Click on the image to replace it with your own content.</p>
          </div>
          <div style="flex: 1; min-width: 300px;" class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder')}
          </div>
        </div>`,
        placeholder: 'Two-column text and image layout',
      }
    ]
  },  {
    id: 'image-top-text-bottom',
    name: 'Image Top, Text Bottom',
    description: 'Vertical layout with image on top and text below',
    preview: '🖼️ \n 📝',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="margin: 2rem 0;">
          <div style="text-align: center; margin-bottom: 2rem;" class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder', 'max-width: 100%;')}
          </div>
          <div>
            <p>Your content goes here, positioned below the image. This layout is great for featured articles, product showcases, or any content where you want the image to be the focal point.</p>
            <p>The image will automatically resize to fit the container while maintaining its aspect ratio. You can easily replace it by clicking on the placeholder image above.</p>
          </div>
        </div>`,
        placeholder: 'Image top, text bottom layout',
      }
    ]
  },  {
    id: 'text-top-image-bottom',
    name: 'Text Top, Image Bottom',
    description: 'Vertical layout with text on top and image below',
    preview: '📝 \n 🖼️',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="margin: 2rem 0;">
          <div style="margin-bottom: 2rem;">
            <p>Your content goes here, positioned above the image. This layout works well when you want to introduce a topic or provide context before showing the visual element.</p>
            <p>Use this layout for explanations, instructions, or narratives that lead into visual content. The text provides context and the image supports or illustrates your points.</p>
          </div>
          <div style="text-align: center;" class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder', 'max-width: 100%;')}
          </div>
        </div>`,
        placeholder: 'Text top, image bottom layout',
      }
    ]
  },  {
    id: 'centered-image-with-captions',
    name: 'Centered Image with Captions',
    description: 'Centered image with text above and below as captions',
    preview: '📝🖼️📝',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="margin: 2rem 0; text-align: center;">
          <p style="margin-bottom: 1rem; font-style: italic; color: #666;">Caption or introduction text above the image</p>
          <div class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder', 'max-width: 80%; box-shadow: 0 4px 8px rgba(0,0,0,0.1);')}
          </div>
          <p style="margin-top: 1rem; font-size: 14px; color: #888; font-style: italic;">Caption or description text below the image. Perfect for photo credits, descriptions, or additional context.</p>
        </div>`,
        placeholder: 'Centered image with captions',
      }
    ]
  },  {
    id: 'three-column-mixed',
    name: 'Three Column Mixed',
    description: 'Three columns with mixed content: text, image, text',
    preview: '📝🖼️📝',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin: 2rem 0; align-items: start;">
          <div>
            <h3 style="margin-top: 0;">Left Column</h3>
            <p>Content for the left column. This could be an introduction, key points, or supporting information.</p>
            <ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>
          </div>
          <div style="text-align: center;" class="template-image-container">
            ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Clickable Placeholder')}
            <p style="font-size: 12px; color: #666; margin-top: 0.5rem; font-style: italic;">Center Image</p>
          </div>
          <div>
            <h3 style="margin-top: 0;">Right Column</h3>
            <p>Content for the right column. This could be conclusions, additional details, or call-to-action information.</p>
            <p><strong>Note:</strong> This layout works best on larger screens and will stack on mobile devices.</p>
          </div>
        </div>`,
        placeholder: 'Three column mixed layout',
      }
    ]
  },  {
    id: 'image-grid-layout',
    name: 'Image Grid with Text',
    description: 'Multiple images in a grid with accompanying text',
    preview: '🖼️🖼️📝',
    category: 'layout',
    blocks: [
      {
        id: 'container-1',
        type: 'text',
        content: `<div style="margin: 2rem 0;">
          <h2 style="text-align: center; margin-bottom: 2rem;">Image Gallery Section</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div class="template-image-container">
              ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Placeholder 1', 'width: 100%; height: 200px; object-fit: cover;')}
            </div>
            <div class="template-image-container">
              ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Placeholder 2', 'width: 100%; height: 200px; object-fit: cover;')}
            </div>
          </div>
          <p>This layout is perfect for showcasing multiple related images with descriptive text. Each image can be clicked to replace with your own content.</p>
          <p>The grid automatically adjusts for different screen sizes, and you can add more images by duplicating the image elements in the HTML.</p>
        </div>`,
        placeholder: 'Image grid with text layout',
      }
    ]  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Large heading with subtitle and centered image',
    preview: '📋 Hero',
    category: 'content',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: '<h1 style="text-align: center;">Your Main Headline</h1>',
        placeholder: 'Enter your main headline',
        props: { level: 1, alignment: 'center' }
      },
      {
        id: 'text-1',
        type: 'text',
        content: '<p style="text-align: center; font-size: 18px; margin: 1rem 0 2rem 0;">Your subtitle or description goes here. This provides context and additional information about your main topic.</p>',
        placeholder: 'Enter your subtitle',
        props: { alignment: 'center' }
      },      {
        id: 'image-1',
        type: 'text',
        content: `<div style="text-align: center; margin: 2rem 0;" class="template-image-container">
          ${enhanceImageWithClickHandler('/images/grid-image/image-placeholder.jpg', 'Hero Image', 'max-width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);')}
        </div>`,
        placeholder: 'Add your hero image here',
      }
    ]
  },
  {
    id: 'feature-highlight',
    name: 'Feature Highlight',
    description: 'Three-column layout for highlighting features or services',
    preview: '📝 📝 📝',
    category: 'content',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: '<h2>Feature 1</h2>',
        placeholder: 'Feature title',
        props: { level: 2 }
      },
      {
        id: 'text-1',
        type: 'text',
        content: '<p>Description of your first feature or service.</p>',
        placeholder: 'Feature description',
      },
      {
        id: 'heading-2',
        type: 'heading',
        content: '<h2>Feature 2</h2>',
        placeholder: 'Feature title',
        props: { level: 2 }
      },
      {
        id: 'text-2',
        type: 'text',
        content: '<p>Description of your second feature or service.</p>',
        placeholder: 'Feature description',
      },
      {
        id: 'heading-3',
        type: 'heading',
        content: '<h2>Feature 3</h2>',
        placeholder: 'Feature title',
        props: { level: 2 }
      },
      {
        id: 'text-3',
        type: 'text',
        content: '<p>Description of your third feature or service.</p>',
        placeholder: 'Feature description',
      }
    ]
  },
  {
    id: 'article-structure',
    name: 'Article Structure',
    description: 'Standard article layout with introduction, main content, and conclusion',
    preview: '📰 Article',
    category: 'content',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: '<h1>Article Title</h1>',
        placeholder: 'Enter article title',
        props: { level: 1 }
      },
      {
        id: 'text-1',
        type: 'text',
        content: '<p>Introduction: Start with an engaging introduction that hooks your readers and provides an overview of what they\'ll learn.</p>',
        placeholder: 'Write your introduction',
      },
      {
        id: 'heading-2',
        type: 'heading',
        content: '<h2>Main Topic</h2>',
        placeholder: 'Main section heading',
        props: { level: 2 }
      },
      {
        id: 'text-2',
        type: 'text',
        content: '<p>Main content: Dive deep into your topic with detailed explanations, examples, and insights.</p>',
        placeholder: 'Write your main content',
      },
      {
        id: 'list-1',
        type: 'list',
        content: '<ul><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul>',
        placeholder: 'Add your key points',
        props: { style: 'disc' }
      },
      {
        id: 'heading-3',
        type: 'heading',
        content: '<h2>Conclusion</h2>',
        placeholder: 'Conclusion heading',
        props: { level: 2 }
      },
      {
        id: 'text-3',
        type: 'text',
        content: '<p>Conclusion: Summarize your main points and provide a clear takeaway for your readers.</p>',
        placeholder: 'Write your conclusion',
      }
    ]
  },  {
    id: 'quote-highlight',
    name: 'Quote Highlight',
    description: 'Featured quote with attribution and surrounding content',
    preview: '💬 Quote',
    category: 'content',
    blocks: [
      {
        id: 'text-1',
        type: 'text',
        content: '<p>Context or introduction to the quote.</p>',
        placeholder: 'Add context before the quote',
      },
      {
        id: 'quote-1',
        type: 'quote',
        content: '<blockquote>"Your inspirational or important quote goes here."</blockquote>',
        placeholder: 'Enter your quote',
      },
      {
        id: 'text-2',
        type: 'text',
        content: '<p><em>— Quote Attribution</em></p>',
        placeholder: 'Add quote attribution',
        props: { alignment: 'right' }
      },
      {
        id: 'text-3',
        type: 'text',
        content: '<p>Additional content or explanation following the quote.</p>',
        placeholder: 'Add follow-up content',
      }
    ]
  },
  {
    id: 'step-by-step',
    name: 'Step-by-Step Guide',
    description: 'Numbered steps for tutorials and how-to guides',
    preview: '1️⃣ 2️⃣ 3️⃣',
    category: 'content',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: '<h2>How to [Your Topic]</h2>',
        placeholder: 'Guide title',
        props: { level: 2 }
      },
      {
        id: 'text-intro',
        type: 'text',
        content: '<p>Brief introduction explaining what this guide will help the reader accomplish.</p>',
        placeholder: 'Guide introduction',
      },
      {
        id: 'step-1',
        type: 'text',
        content: '<h3>Step 1: First Action</h3><p>Detailed explanation of the first step. Include any important details or tips.</p>',
        placeholder: 'First step',
      },
      {
        id: 'step-2',
        type: 'text',
        content: '<h3>Step 2: Second Action</h3><p>Detailed explanation of the second step. Build upon the previous step.</p>',
        placeholder: 'Second step',
      },
      {
        id: 'step-3',
        type: 'text',
        content: '<h3>Step 3: Final Action</h3><p>Complete the process with this final step and any concluding remarks.</p>',
        placeholder: 'Third step',
      },
      {
        id: 'conclusion',
        type: 'text',
        content: '<p><strong>Congratulations!</strong> You have successfully completed [your task]. What\'s next?</p>',
        placeholder: 'Conclusion',
      }
    ]
  },  {
    id: 'comparison-table',
    name: 'Comparison Layout',
    description: 'Side-by-side comparison of two options or concepts',
    preview: '⚖️ VS',
    category: 'mixed',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: '<h2>Option A vs Option B</h2>',
        placeholder: 'Comparison title',
        props: { level: 2, alignment: 'center' }
      },
      {
        id: 'comparison',
        type: 'text',
        content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;"><div style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;"><h3 style="margin-top: 0; color: #1f2937;">Option A</h3><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul><p><strong>Best for:</strong> Describe ideal use case</p></div><div style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;"><h3 style="margin-top: 0; color: #1f2937;">Option B</h3><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul><p><strong>Best for:</strong> Describe ideal use case</p></div></div>',
        placeholder: 'Comparison content',
      }
    ]
  },

];


export const templateCategories: TemplateCategory[] = [
  {
    id: 'layout',
    name: 'Layouts',
    icon: '📐',
    templates: contentTemplates.filter(t => t.category === 'layout')
  },
  {
    id: 'content',
    name: 'Content Blocks',
    icon: '📝',
    templates: contentTemplates.filter(t => t.category === 'content')
  },
  {
    id: 'mixed',
    name: 'Mixed',
    icon: '🎨',
    templates: contentTemplates.filter(t => t.category === 'mixed')
  }
];


export const generateTemplateHTML = (template: ContentTemplate): string => {
  const templateContent = template.blocks.map(block => {
    return block.content;
  }).join('\n\n');
  
  const cleanedContent = templateContent.replace(/onclick="[^"]*"/g, '');
  
  return cleanedContent;
};

export const insertTemplateIntoEditor = (template: ContentTemplate, currentContent: string): string => {
  const templateHTML = generateTemplateHTML(template);
  

  if (currentContent && currentContent.trim() !== '') {
    return currentContent + '\n\n' + templateHTML;
  }

  return templateHTML;
};
