export const MERGE_TAGS = [
  { label: "First Name", tag: "{{first_name}}" },
  { label: "Last Name", tag: "{{last_name}}" },
  { label: "Email", tag: "{{email}}" },
] as const;

export type MergeTag = (typeof MERGE_TAGS)[number];

/** Sample values shown in the email preview modal. */
const PREVIEW_SAMPLE_VALUES: Record<string, string> = {
  "{{first_name}}": "Jane",
  "{{last_name}}": "Doe",
  "{{email}}": "jane.doe@example.com",
};

/**
 * Replaces all known merge tags with sample placeholder values.
 * Used only in the preview modal — never sent to recipients.
 */
export function substituteMergeTagsForPreview(text: string): string {
  if (!text) return text;
  return Object.entries(PREVIEW_SAMPLE_VALUES).reduce(
    (result, [tag, value]) =>
      result.replace(new RegExp(tag.replace(/[{}]/g, "\\$&"), "gi"), value),
    text
  );
}
