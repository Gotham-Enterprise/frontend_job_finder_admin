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

// HTML entity mappings
const HTML_ENTITIES: { [key: string]: string } = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&sect;': '§',
  '&para;': '¶',
  '&deg;': '°',
  '&plusmn;': '±',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾'
};

export const processHtmlEntities = (
  text: string,
  cursorPosition: number
): { text: string; newCursorPosition: number } => {
  let processedText = text;
  let newCursorPosition = cursorPosition;
  
  // Look for HTML entities and replace them
  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    const entityIndex = processedText.lastIndexOf(entity, cursorPosition);
    
    // Check if the entity was just completed (cursor is right after it)
    if (entityIndex !== -1 && entityIndex + entity.length === cursorPosition) {
      processedText = 
        processedText.substring(0, entityIndex) + 
        replacement + 
        processedText.substring(entityIndex + entity.length);
      
      // Adjust cursor position
      newCursorPosition = entityIndex + replacement.length;
      break;
    }
  }
  
  return { text: processedText, newCursorPosition };
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
