import { US_STATE_CODE_TO_NAME } from "@/lib/useStatesCities";

function resolveUsStateAbbreviation(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (US_STATE_CODE_TO_NAME[upper]) return upper;
  const found = Object.entries(US_STATE_CODE_TO_NAME).find(
    ([, name]) => name.toUpperCase() === upper,
  );
  return found?.[0] ?? null;
}

/** e.g. `AL` → `Alabama(AL)`; unknown non-empty codes returned trimmed; empty/null → null. */
export function formatStateOfLicensureForDisplay(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  const name = US_STATE_CODE_TO_NAME[upper];
  if (name) return `${name}(${upper})`;
  return trimmed;
}

/** e.g. `AL` or `alabama` → `Alabama (AL)`; unrecognized non-empty values returned trimmed. */
export function formatUsStateCodeForDisplay(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const abbr = resolveUsStateAbbreviation(trimmed);
  if (!abbr) return trimmed;
  const name = US_STATE_CODE_TO_NAME[abbr];
  return name ? `${name} (${abbr})` : trimmed;
}
