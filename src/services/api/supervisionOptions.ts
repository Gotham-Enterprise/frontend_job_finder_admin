import { apiGet } from "./apiUtils";

export interface SupervisionSelectOption {
  label: string;
  value: string;
}

export const SUPERVISION_PROFILE_OPTION_PARAMS = [
  "certificate",
  "format",
  "availability",
  "patientPopulation",
] as const;

export const SUPERVISION_SUPERVISEE_OPTION_PARAMS = [
  "format",
  "howSoon",
  "availability",
  "budgetType",
] as const;

export type SupervisionProfileOptionsParam =
  | (typeof SUPERVISION_PROFILE_OPTION_PARAMS)[number]
  | (typeof SUPERVISION_SUPERVISEE_OPTION_PARAMS)[number];

type RawOption = string | { label: string; value: string };

function normalizeOption(raw: RawOption): SupervisionSelectOption {
  if (typeof raw === "string") return { label: raw, value: raw };
  return { label: raw.label, value: String(raw.value) };
}

/** GET /api/supervision/options?param=… — same lists as supervisor signup. */
export async function fetchSupervisionOptions(
  param: SupervisionProfileOptionsParam
): Promise<SupervisionSelectOption[]> {
  const res = await apiGet<{ success?: boolean; data?: RawOption[] }>(
    `/api/supervision/options?param=${encodeURIComponent(param)}`
  );
  const list = res?.data;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeOption);
}
