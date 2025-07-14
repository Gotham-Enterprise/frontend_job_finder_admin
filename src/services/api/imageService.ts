/**
 * Optimized Image Handling for Blog System
 * Avoids base64 in payloads, uses efficient image references
 */

export interface ImageUploadResponse {
  success: boolean;
  imageId: string;
  urls: {
    thumbnail: string;   // 150x150
    small: string;      // 300x200
    medium: string;     // 600x400
    large: string;      // 900x600
    original: string;   // Original size
  };
  metadata: {
    filename: string;
    originalSize: number;
    processedSizes: {
      thumbnail: number;
      small: number;
      medium: number;
      large: number;
    };
    dimensions: {
      width: number;
      height: number;
    };
    format: string;
    uploadedAt: string;
  };
}

export interface ImageUploadService {
  /**
   * Upload and process image - returns image ID and URLs
   */
  uploadImage(file: File, options?: {
    generateSizes?: boolean;
    quality?: number;
    formats?: ('webp' | 'jpeg' | 'png')[];
  }): Promise<ImageUploadResponse>;

  /**
   * Upload multiple images for gallery
   */
  uploadMultipleImages(files: File[]): Promise<ImageUploadResponse[]>;

  /**
   * Delete image and all its variants
   */
  deleteImage(imageId: string): Promise<boolean>;

  /**
   * Get image metadata
   */
  getImageMetadata(imageId: string): Promise<ImageUploadResponse['metadata']>;
}

// Implementation for your blog system with AWS S3
export class BlogImageService implements ImageUploadService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/images') {
    this.apiUrl = apiUrl;
  }

  async uploadImage(file: File, options = {}): Promise<ImageUploadResponse> {
    // Method 1: Direct upload via backend
    const formData = new FormData();
    formData.append('image', file);
    formData.append('options', JSON.stringify({
      generateSizes: true,
      quality: 80,
      formats: ['webp', 'jpeg'],
      ...options
    }));

    const response = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Method 2: Direct S3 upload with pre-signed URLs (More efficient)
   */
  async uploadImageDirectS3(file: File, options = {}): Promise<ImageUploadResponse> {
    try {
      // Step 1: Get pre-signed URL from backend
      const presignResponse = await fetch(`${this.apiUrl}/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          options
        })
      });

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, imageId, fields } = await presignResponse.json();

      // Step 2: Upload directly to S3
      const s3FormData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        s3FormData.append(key, value as string);
      });
      s3FormData.append('file', file);

      const s3Response = await fetch(uploadUrl, {
        method: 'POST',
        body: s3FormData
      });

      if (!s3Response.ok) {
        throw new Error('S3 upload failed');
      }

      // Step 3: Confirm upload and get processed URLs
      const confirmResponse = await fetch(`${this.apiUrl}/confirm-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      });

      return confirmResponse.json();
    } catch (error) {
      console.error('Direct S3 upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files: File[]): Promise<ImageUploadResponse[]> {
    const uploads = files.map(file => this.uploadImage(file));
    return Promise.all(uploads);
  }

  async deleteImage(imageId: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/${imageId}`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  async getImageMetadata(imageId: string): Promise<ImageUploadResponse['metadata']> {
    const response = await fetch(`${this.apiUrl}/${imageId}/metadata`);
    if (!response.ok) {
      throw new Error(`Failed to get metadata: ${response.statusText}`);
    }
    return response.json();
  }
}

// Usage in components
export const useImageUpload = () => {
  const imageService = new BlogImageService();

  const uploadAndGetReference = async (file: File) => {
    try {
      // Upload image and get reference
      const uploadResult = await imageService.uploadImage(file);
      
      // Return image component data (no base64!)
      return {
        imageId: uploadResult.imageId,
        url: uploadResult.urls.medium, // For preview
        alt: file.name,
        metadata: uploadResult.metadata
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  return {
    uploadAndGetReference,
    uploadMultiple: imageService.uploadMultipleImages.bind(imageService),
    deleteImage: imageService.deleteImage.bind(imageService)
  };
};

// Backend API structure (Node.js/Express example)
export const BACKEND_API_EXAMPLE = `
// POST /api/images/upload
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const options = JSON.parse(req.body.options || '{}');
    
    // Generate unique ID
    const imageId = generateImageId();
    
    // Process image into multiple sizes
    const processedImages = await processImageSizes(file, {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 200 },
      medium: { width: 600, height: 400 },
      large: { width: 900, height: 600 }
    });
    
    // Upload to CDN/Storage (AWS S3, Cloudinary, etc.)
    const urls = await uploadToStorage(imageId, processedImages);
    
    // Save metadata to database
    await saveImageMetadata(imageId, {
      filename: file.originalname,
      urls,
      dimensions: processedImages.original.dimensions,
      uploadedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      imageId,
      urls,
      metadata: {
        filename: file.originalname,
        originalSize: file.size,
        processedSizes: {
          thumbnail: processedImages.thumbnail.size,
          small: processedImages.small.size,
          medium: processedImages.medium.size,
          large: processedImages.large.size
        },
        dimensions: processedImages.original.dimensions,
        format: processedImages.original.format,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/blogs/:id/render - Render blog with images
app.get('/api/blogs/:id/render', async (req, res) => {
  const blog = await getBlogById(req.params.id);
  
  // Replace image IDs with actual URLs
  const renderedHtml = await renderBlogWithImages(blog.layout, blog.images);
  
  res.json({
    html: renderedHtml,
    metadata: blog.metadata
  });
});
`;

// Image optimization utilities
export const ImageOptimizer = {
  /**
   * Get optimized image URL based on context
   */
  getOptimizedUrl(imageId: string, context: 'thumbnail' | 'card' | 'hero' | 'gallery') {
    const sizeMap = {
      thumbnail: 'thumbnail',
      card: 'medium', 
      hero: 'large',
      gallery: 'medium'
    };
    
    return `/api/images/${imageId}/${sizeMap[context]}`;
  },

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(imageId: string, urls: ImageUploadResponse['urls']) {
    return [
      `${urls.small} 300w`,
      `${urls.medium} 600w`,
      `${urls.large} 900w`
    ].join(', ');
  },

  /**
   * Generate picture element for WebP support
   */
  generatePictureElement(imageId: string, alt: string) {
    return `
      <picture>
        <source srcset="/api/images/${imageId}/webp/small 300w, /api/images/${imageId}/webp/medium 600w, /api/images/${imageId}/webp/large 900w" type="image/webp">
        <img src="/api/images/${imageId}/medium" alt="${alt}" loading="lazy" />
      </picture>
    `;
  }
};

// Professional Blog Payload Structure
export interface ProfessionalBlogPayload {
  // Core content
  title: string;
  permalink: string;
  excerpt: string;
  content: string; // Rich HTML content
  
  // Visual layout (if using visual builder)
  layout?: {
    id: string;
    components: Array<{
      id: string;
      type: string;
      content: any;
      styles: Record<string, any>;
    }>;
    settings: {
      maxWidth: string;
      fontFamily: string;
      responsive: boolean;
    };
  };

  // Image references (NOT base64!)
  images: {
    featured?: {
      imageId: string;
      alt: string;
      caption?: string;
    };
    content: Array<{
      imageId: string;
      alt: string;
      caption?: string;
      position?: 'inline' | 'center' | 'left' | 'right';
    }>;
    gallery?: Array<{
      imageId: string;
      alt: string;
      caption?: string;
    }>;
  };

  // Publishing settings
  status: 'draft' | 'published' | 'scheduled' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;
  scheduledDate?: string;

  // SEO & Social
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
  
  social: {
    title?: string;
    description?: string;
    imageId?: string; // Reference to social share image
  };

  // Organization
  categories: string[];
  tags: string[];
  
  // Settings
  allowComments: boolean;
  allowPings: boolean;
  featuredPost: boolean;
  
  // Author & timestamps
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Custom fields for extensibility
  customFields?: Record<string, any>;
}

// Validation utilities
export const BlogPayloadValidator = {
  /**
   * Validate blog payload before sending to backend
   */
  validate(payload: ProfessionalBlogPayload): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!payload.title?.trim()) errors.push('Title is required');
    if (!payload.permalink?.trim()) errors.push('Permalink is required');
    if (!payload.content?.trim()) errors.push('Content is required');
    if (!payload.authorId?.trim()) errors.push('Author ID is required');

    // Permalink validation
    if (payload.permalink && !/^[a-z0-9-]+$/.test(payload.permalink)) {
      errors.push('Permalink must contain only lowercase letters, numbers, and hyphens');
    }

    // SEO validation
    if (payload.seo.title && payload.seo.title.length > 60) {
      errors.push('SEO title should be under 60 characters');
    }
    if (payload.seo.description && payload.seo.description.length > 160) {
      errors.push('SEO description should be under 160 characters');
    }

    // Date validation
    if (payload.status === 'scheduled' && !payload.scheduledDate) {
      errors.push('Scheduled date is required for scheduled posts');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitize payload before sending
   */
  sanitize(payload: ProfessionalBlogPayload): ProfessionalBlogPayload {
    return {
      ...payload,
      title: payload.title?.trim() || '',
      permalink: payload.permalink?.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') || '',
      excerpt: payload.excerpt?.trim() || '',
      seo: {
        ...payload.seo,
        title: payload.seo.title?.trim() || payload.title?.trim() || '',
        description: payload.seo.description?.trim() || payload.excerpt?.trim() || '',
        keywords: payload.seo.keywords?.filter(k => k.trim()).map(k => k.trim()) || []
      },
      categories: payload.categories?.filter(c => c.trim()).map(c => c.trim()) || [],
      tags: payload.tags?.filter(t => t.trim()).map(t => t.trim()) || [],
      updatedAt: new Date().toISOString()
    };
  }
};

// Professional API client for blog operations
export class BlogAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create new blog post
   */
  async createBlog(payload: ProfessionalBlogPayload): Promise<{ success: boolean; blogId?: string; errors?: string[] }> {
    // Validate payload
    const validation = BlogPayloadValidator.validate(payload);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Sanitize payload
    const sanitizedPayload = BlogPayloadValidator.sanitize(payload);

    try {
      const response = await fetch(`${this.baseUrl}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(sanitizedPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, errors: [result.error || 'Failed to create blog'] };
      }

      return { success: true, blogId: result.blogId };
    } catch (error) {
      console.error('Blog creation failed:', error);
      return { success: false, errors: ['Network error occurred'] };
    }
  }

  /**
   * Update existing blog post
   */
  async updateBlog(blogId: string, payload: Partial<ProfessionalBlogPayload>): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          updatedAt: new Date().toISOString()
        })
      });

      const result = await response.json();
      return { success: response.ok, errors: response.ok ? [] : [result.error] };
    } catch (error) {
      return { success: false, errors: ['Network error occurred'] };
    }
  }

  /**
   * Get blog for editing
   */
  async getBlog(blogId: string): Promise<ProfessionalBlogPayload | null> {
    try {
      const response = await fetch(`${this.baseUrl}/blogs/${blogId}`);
      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      return null;
    }
  }
}

// Usage hook for React components
export const useBlogAPI = () => {
  const blogAPI = new BlogAPIClient();
  const imageService = new BlogImageService();

  const createBlogWithImages = async (
    payload: Omit<ProfessionalBlogPayload, 'images'>,
    imageFiles: { file: File; type: 'featured' | 'content' | 'gallery'; alt: string }[]
  ) => {
    try {
      // Step 1: Upload all images first
      const uploadedImages = await Promise.all(
        imageFiles.map(async ({ file, type, alt }) => {
          const result = await imageService.uploadImage(file);
          return { ...result, type, alt };
        })
      );

      // Step 2: Structure image references
      const images: ProfessionalBlogPayload['images'] = {
        content: [],
        gallery: []
      };

      uploadedImages.forEach(img => {
        if (img.type === 'featured') {
          images.featured = { imageId: img.imageId, alt: img.alt };
        } else if (img.type === 'content') {
          images.content.push({ imageId: img.imageId, alt: img.alt });
        } else if (img.type === 'gallery') {
          images.gallery!.push({ imageId: img.imageId, alt: img.alt });
        }
      });

      // Step 3: Create blog with image references
      const completePayload: ProfessionalBlogPayload = {
        ...payload,
        images
      };

      return blogAPI.createBlog(completePayload);
    } catch (error) {
      console.error('Blog creation with images failed:', error);
      return { success: false, errors: ['Failed to upload images'] };
    }
  };

  return {
    createBlog: blogAPI.createBlog.bind(blogAPI),
    updateBlog: blogAPI.updateBlog.bind(blogAPI),
    getBlog: blogAPI.getBlog.bind(blogAPI),
    createBlogWithImages,
    uploadImage: imageService.uploadImage.bind(imageService),
    uploadImageDirectS3: imageService.uploadImageDirectS3.bind(imageService)
  };
};
