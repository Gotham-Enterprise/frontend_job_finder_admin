export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/_+/g, '-') 
    .replace(/-+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
};


export const sanitizePermalink = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, ''); 
};


export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
};


export const ensureUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

export const cleanSlug = (inputSlug: string): string => {
  if (!inputSlug) return '';
  
  return inputSlug
    .replace(/\?/g, '') 
    .replace(/:/g, '')
    .replace(/,/g, '') 
    .replace(/—/g, '-') 
    .replace(/'/g, '') 
    .replace(/"/g, '') 
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') 
    .replace(/^-|-$/g, ''); 
};

export const removeLeadingSlash = (slug: string): string => {
  if (!slug) return '';
  return slug.startsWith('/') ? slug.substring(1) : slug;
};


export const processSlug = (slug: string): string => {
  if (!slug) return '';
  const slugWithoutSlash = removeLeadingSlash(slug);
  return cleanSlug(slugWithoutSlash);
};


export const isValidUUID = (str: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};


export const generateSlugVariations = (slug: string): string[] => {
  if (!slug) return [];
  
  return [
    slug,
    `/${slug}`,
    cleanSlug(slug),
    cleanSlug(`/${slug}`),
    processSlug(slug),
    processSlug(`/${slug}`)
  ].filter((variation, index, arr) => arr.indexOf(variation) === index); 
}; 
