/**
 * Pronouns / gender identity / languages + per-block public-visibility flags,
 * stored on the supervision account (both roles). Admin endpoints return the
 * raw stored values; the public app applies the visibility flags itself.
 */
export interface IdentityPreferences {
  pronouns: string[];
  showPronouns: boolean;
  genderIdentity: string | null;
  customGenderIdentity: string | null;
  showGenderIdentity: boolean;
  languages: string[];
  showLanguages: boolean;
}

/** Detail responses may predate the columns, so every field is optional on the wire. */
export type IdentityPreferencesResponse = Partial<IdentityPreferences>;

/** Full replace — every field is sent so a cleared value persists. */
export type IdentityPreferencesPayload = IdentityPreferences;
