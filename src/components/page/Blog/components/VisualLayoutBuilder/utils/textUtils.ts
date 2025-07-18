export const processTextSelection = (
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>
): { selectedText: string; start: number; end: number } | null => {
  if (!ref.current) return null;
  
  const { selectionStart, selectionEnd, value } = ref.current;
  const start = selectionStart ?? 0;
  const end = selectionEnd ?? 0;
  
  if (start !== end) {
    const selectedText = value.substring(start, end);
    return { selectedText, start, end };
  }
  
  return null;
};

export const createLinkHtml = (
  text: string, 
  url: string, 
  target: string = '_self'
): string => {
  const relAttribute = target === '_blank' ? ' rel="noopener noreferrer"' : '';
  return `<a href="${url}" target="${target}"${relAttribute}>${text}</a>`;
};

export const removeAllLinksFromText = (text: string): string => {
  return text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
};

export const replaceTextWithLink = (
  originalText: string,
  selectedText: string,
  linkHtml: string
): string => {
  return originalText.replace(selectedText, linkHtml);
};
