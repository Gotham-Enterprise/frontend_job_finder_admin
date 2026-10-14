/**
 * Optional self-identification on supervision accounts (both roles): pronouns,
 * gender identity, and languages, each with its own "display on my public
 * profile" flag. Same codes and labels as frontend_find_supervisor_next
 * `lib/constants/identity-preferences.ts` — keep the two in sync.
 */

export interface IdentityOption {
  value: string;
  label: string;
}

export const PRONOUN_OPTIONS: readonly IdentityOption[] = [
  { value: "HE_HIM_HIS", label: "He / Him / His" },
  { value: "SHE_HER_HERS", label: "She / Her / Hers" },
  { value: "THEY_THEM_THEIRS", label: "They / Them / Theirs" },
];

export const GENDER_IDENTITY_SELF_DESCRIBE = "SELF_DESCRIBE";
export const GENDER_IDENTITY_PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY";

export const GENDER_IDENTITY_OPTIONS: readonly IdentityOption[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-Binary" },
  { value: GENDER_IDENTITY_SELF_DESCRIBE, label: "Prefer to self-describe" },
  { value: GENDER_IDENTITY_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

/** Mirrors the backend validator (`customGenderIdentity` is VARCHAR(100)). */
export const CUSTOM_GENDER_IDENTITY_MAX_LENGTH = 100;

/**
 * Same languages the job site offers on job posts (the `Language` table minus
 * "Other"), keyed by ISO 639 code. Alphabetical by label.
 */
export const LANGUAGE_OPTIONS: readonly IdentityOption[] = [
  { value: "am", label: "Amharic" },
  { value: "ar", label: "Arabic" },
  { value: "bn", label: "Bengali" },
  { value: "bho", label: "Bhojpuri" },
  { value: "my", label: "Burmese" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "ff", label: "Fula" },
  { value: "de", label: "German" },
  { value: "gu", label: "Gujarati" },
  { value: "hak", label: "Hakka Chinese" },
  { value: "ha", label: "Hausa" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "jv", label: "Javanese" },
  { value: "cjy", label: "Jin Chinese" },
  { value: "kn", label: "Kannada" },
  { value: "ko", label: "Korean" },
  { value: "mai", label: "Maithili" },
  { value: "ms", label: "Malay/Indonesian" },
  { value: "ml", label: "Malayalam" },
  { value: "cmn", label: "Mandarin Chinese" },
  { value: "mr", label: "Marathi" },
  { value: "or", label: "Odia" },
  { value: "om", label: "Oromo" },
  { value: "ps", label: "Pashto" },
  { value: "fa", label: "Persian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "pa", label: "Punjabi" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sd", label: "Sindhi" },
  { value: "nan", label: "Southern Min" },
  { value: "es", label: "Spanish" },
  { value: "su", label: "Sundanese" },
  { value: "tl", label: "Tagalog" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" },
  { value: "uz", label: "Uzbek" },
  { value: "vi", label: "Vietnamese" },
  { value: "wuu", label: "Wu Chinese" },
  { value: "hsn", label: "Xiang Chinese" },
  { value: "yo", label: "Yoruba" },
  { value: "yue", label: "Yue Chinese (Cantonese)" },
];

export const MAX_LANGUAGES = 30;

function buildLabelMap(options: readonly IdentityOption[]): ReadonlyMap<string, string> {
  return new Map(options.map((option) => [option.value, option.label]));
}

const PRONOUN_LABELS = buildLabelMap(PRONOUN_OPTIONS);
const GENDER_IDENTITY_LABELS = buildLabelMap(GENDER_IDENTITY_OPTIONS);
const LANGUAGE_LABELS = buildLabelMap(LANGUAGE_OPTIONS);

/** Unknown codes are returned as-is so nothing stored is silently dropped. */
export function pronounLabel(value: string): string {
  return PRONOUN_LABELS.get(value) ?? value;
}

export function genderIdentityLabel(value: string): string {
  return GENDER_IDENTITY_LABELS.get(value) ?? value;
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS.get(code) ?? code;
}
