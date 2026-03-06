/**
 * Sanitizes job description HTML by removing &nbsp;, empty tags, and excessive whitespace.
 */
export function sanitizeJobDescriptionHtml(html: string): string {
  if (!html || typeof html !== "string") return html;

  return (
    html
      // Replace non-breaking spaces with regular spaces
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/g, " ")
      .replace(/\u00A0/g, " ")
      // Remove empty block/inline elements (with optional whitespace inside)
      .replace(/<(p|div|span|li|td|th|h[1-6])\s*>\s*<\/\1>/gi, "")
      // Collapse multiple spaces to single space
      .replace(/[ \t]+/g, " ")
      // Collapse multiple newlines to double newline (preserve paragraph breaks)
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace from start/end
      .trim()
  );
}
