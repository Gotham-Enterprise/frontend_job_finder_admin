export const SITE_CONFIG = {
  PRODUCTION_URL: 'https://gothamenterprisesltd.com/home',
  
  APP_NAME: 'Job Finder Admin',
  APP_DESCRIPTION: 'Admin dashboard for job finder platform',
  
  DEFAULT_SHARE_IMAGE: 'https://gothamenterprisesltd.com/assets/img/home-right-banner.svg',
  
  SOCIAL_SHARING: {
    DEFAULT_HASHTAGS: ['jobfinder', 'blog', 'careers'],
    TWITTER_HANDLE: '@yourhandle', 
  }
};

export const getShareBaseUrl = (): string => {

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
    
    return isLocalhost ? SITE_CONFIG.PRODUCTION_URL : window.location.origin;
  }
  
  return SITE_CONFIG.PRODUCTION_URL;
};

export const generateBlogUrl = (category: string, blogId: string | number, title: string): string => {
  const baseUrl = 'https://gothamenterprisesltd.com';
  // Clean and format the parameters
  const cleanCategory = category?.toLowerCase().replace(/\s+/g, '-') || 'general';
  const cleanTitle = title?.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
  
  return `${baseUrl}/blog/${cleanCategory}/${blogId}/${cleanTitle}`;
};
