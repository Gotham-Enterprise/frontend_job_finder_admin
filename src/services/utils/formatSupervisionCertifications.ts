import type { SupervisionSelectOption } from "../api/supervisionOptions";

function humanizeUnknownSupervisionCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return code;
  if (trimmed.includes("_")) {
    return trimmed
      .toLowerCase()
      .split("_")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
      .filter(Boolean)
      .join(" ");
  }
  if (trimmed.length <= 4 && trimmed === trimmed.toUpperCase()) return trimmed;
  return trimmed.charAt(0) + trimmed.slice(1).toLowerCase();
}

/** Maps a single stored enum to its API option label, with fallback for unknown values. */
export function formatSingleSupervisionOptionDisplay(
  code: string | null | undefined,
  options: SupervisionSelectOption[]
): string | null {
  if (code == null || !String(code).trim()) return null;
  const key = String(code).trim();
  const match = options.find((o) => o.value === key);
  return match?.label ?? humanizeUnknownSupervisionCode(key);
}

/** Maps stored enum values to API option labels (comma-separated); falls back for unknown codes. */
export function formatSupervisionCodeListForDisplay(
  codes: string[] | undefined | null,
  options: SupervisionSelectOption[]
): string | null {
  if (!codes?.length) return null;
  const labels = codes.map((code) => {
    const match = options.find((o) => o.value === code);
    return match?.label ?? humanizeUnknownSupervisionCode(code);
  });
  return labels.join(", ");
}

export function formatCertificationListForDisplay(
  codes: string[] | undefined | null,
  options: SupervisionSelectOption[]
): string | null {
  return formatSupervisionCodeListForDisplay(codes, options);
}
