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

// HTML entities that should be removed from content
const HTML_ENTITIES_TO_REMOVE = [
  '&nbsp;',
  '&amp;',
  '&lt;',
  '&gt;',
  '&quot;',
  '&apos;',
  '&ldquo;',
  '&rdquo;',
  '&lsquo;',
  '&rsquo;',
  '&ndash;',
  '&mdash;',
  '&hellip;',
  '&copy;',
  '&reg;',
  '&trade;',
  '&euro;',
  '&pound;',
  '&yen;',
  '&sect;',
  '&para;',
  '&deg;',
  '&plusmn;',
  '&frac12;',
  '&frac14;',
  '&frac34;'
];

export const processHtmlEntities = (
  text: string,
  cursorPosition: number
): { text: string; newCursorPosition: number } => {
  let processedText = text;
  let newCursorPosition = cursorPosition;
  
  // Check if any HTML entity ends exactly at the cursor position
  for (const entity of HTML_ENTITIES_TO_REMOVE) {
    const entityIndex = processedText.lastIndexOf(entity, cursorPosition);

    if (entityIndex !== -1 && entityIndex + entity.length === cursorPosition) {
      // Remove the entity (replace with empty string)
      processedText = 
        processedText.substring(0, entityIndex) + 
        processedText.substring(entityIndex + entity.length);

      newCursorPosition = entityIndex;
      break;
    }
  }
  
  // Also check for entities anywhere in the text and remove them
  if (processedText === text) {
    for (const entity of HTML_ENTITIES_TO_REMOVE) {
      if (processedText.includes(entity)) {
        const beforeEntity = processedText.substring(0, processedText.indexOf(entity));
        processedText = processedText.replace(entity, '');
        
        // Adjust cursor position if it was after the entity
        if (cursorPosition > beforeEntity.length + entity.length) {
          newCursorPosition = cursorPosition - entity.length;
        } else if (cursorPosition > beforeEntity.length) {
          newCursorPosition = beforeEntity.length;
        }
        break;
      }
    }
  }
  
  return { text: processedText, newCursorPosition };
};

export const cleanHtmlEntities = (text: string): string => {
  let cleanedText = text;

  for (const entity of HTML_ENTITIES_TO_REMOVE) {
    cleanedText = cleanedText.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  }
  
  return cleanedText;
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
