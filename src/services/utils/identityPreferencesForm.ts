import {
  CUSTOM_GENDER_IDENTITY_MAX_LENGTH,
  GENDER_IDENTITY_OPTIONS,
  GENDER_IDENTITY_PREFER_NOT_TO_SAY,
  GENDER_IDENTITY_SELF_DESCRIBE,
  genderIdentityLabel,
  languageLabel,
  MAX_LANGUAGES,
  PRONOUN_OPTIONS,
  pronounLabel,
} from "@/constants/identityPreferences";
import type { IdentityPreferencesPayload, IdentityPreferencesResponse } from "@/services/types/identityPreferences";

/**
 * Shared form state, validation, and payload mapping for the identity block on
 * the supervisor and supervisee edit modals.
 */

export interface IdentityPreferencesFormData {
  pronouns: string[];
  showPronouns: boolean;
  /** '' = no selection (the field is optional) */
  genderIdentity: string;
  customGenderIdentity: string;
  showGenderIdentity: boolean;
  languages: string[];
  showLanguages: boolean;
}

export type IdentityPreferencesFieldErrors = Partial<Record<keyof IdentityPreferencesFormData, string>>;

export const emptyIdentityPreferencesForm = (): IdentityPreferencesFormData => ({
  pronouns: [],
  showPronouns: false,
  genderIdentity: "",
  customGenderIdentity: "",
  showGenderIdentity: false,
  languages: [],
  showLanguages: false,
});

/** Stored account values → form values. */
export function mapIdentityPreferencesToFormData(
  user: IdentityPreferencesResponse | null | undefined
): IdentityPreferencesFormData {
  const genderIdentity = user?.genderIdentity?.trim() ?? "";
  return {
    pronouns: (user?.pronouns ?? []).filter(Boolean),
    showPronouns: user?.showPronouns === true,
    genderIdentity,
    customGenderIdentity:
      genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE ? (user?.customGenderIdentity?.trim() ?? "") : "",
    showGenderIdentity: user?.showGenderIdentity === true,
    languages: (user?.languages ?? []).filter(Boolean),
    showLanguages: user?.showLanguages === true,
  };
}

/** Mirrors the backend validator: self-describe needs its text, lengths capped. */
export function validateIdentityPreferencesForm(form: IdentityPreferencesFormData): IdentityPreferencesFieldErrors {
  const errors: IdentityPreferencesFieldErrors = {};
  const validPronouns = new Set(PRONOUN_OPTIONS.map((o) => o.value));
  const validGenders = new Set(GENDER_IDENTITY_OPTIONS.map((o) => o.value));

  if (form.pronouns.some((value) => !validPronouns.has(value))) {
    errors.pronouns = "Invalid pronoun selection";
  }
  if (form.genderIdentity && !validGenders.has(form.genderIdentity)) {
    errors.genderIdentity = "Invalid gender identity";
  }
  const custom = form.customGenderIdentity.trim();
  if (form.genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE && !custom) {
    errors.customGenderIdentity = "Please describe the gender identity";
  } else if (custom.length > CUSTOM_GENDER_IDENTITY_MAX_LENGTH) {
    errors.customGenderIdentity = `Gender identity must be ${CUSTOM_GENDER_IDENTITY_MAX_LENGTH} characters or less`;
  }
  if (form.languages.length > MAX_LANGUAGES) {
    errors.languages = `Select at most ${MAX_LANGUAGES} languages`;
  }
  return errors;
}

export function identityPreferencesFormToPayload(form: IdentityPreferencesFormData): IdentityPreferencesPayload {
  const genderIdentity = form.genderIdentity.trim() || null;
  return {
    pronouns: form.pronouns,
    showPronouns: form.showPronouns,
    genderIdentity,
    customGenderIdentity:
      genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE ? form.customGenderIdentity.trim() || null : null,
    showGenderIdentity: form.showGenderIdentity,
    languages: form.languages,
    showLanguages: form.showLanguages,
  };
}

/**
 * Multipart encoding shared with the public app: lists go as JSON so an empty
 * selection reaches the backend as `[]`, and the gender fields are always
 * present so a removed value is nulled.
 */
export function appendIdentityPreferencesToFormData(fd: FormData, payload: IdentityPreferencesPayload): void {
  fd.append("pronouns", JSON.stringify(payload.pronouns));
  fd.append("showPronouns", String(payload.showPronouns));
  fd.append("genderIdentity", payload.genderIdentity ?? "");
  fd.append("customGenderIdentity", payload.customGenderIdentity ?? "");
  fd.append("showGenderIdentity", String(payload.showGenderIdentity));
  fd.append("languages", JSON.stringify(payload.languages));
  fd.append("showLanguages", String(payload.showLanguages));
}

// ─── Display (admin view) ─────────────────────────────────────────────────────

export function formatPronounsForDisplay(user: IdentityPreferencesResponse): string {
  return (user.pronouns ?? []).filter(Boolean).map(pronounLabel).join(", ");
}

/** Label of the stored identity (the self-description when self-described). */
export function formatGenderIdentityForDisplay(user: IdentityPreferencesResponse): string {
  const value = user.genderIdentity?.trim();
  if (!value) return "";
  if (value === GENDER_IDENTITY_SELF_DESCRIBE) {
    const custom = user.customGenderIdentity?.trim();
    return custom ? `${custom} (self-described)` : genderIdentityLabel(value);
  }
  return genderIdentityLabel(value);
}

export function formatLanguagesForDisplay(user: IdentityPreferencesResponse): string {
  return (user.languages ?? []).filter(Boolean).map(languageLabel).join(", ");
}

/**
 * What the public profile actually shows for the gender block: hidden while
 * the flag is off, and "Prefer not to say" is never shown publicly.
 */
export function isGenderIdentityPubliclyVisible(user: IdentityPreferencesResponse): boolean {
  const value = user.genderIdentity?.trim();
  return user.showGenderIdentity === true && !!value && value !== GENDER_IDENTITY_PREFER_NOT_TO_SAY;
}
