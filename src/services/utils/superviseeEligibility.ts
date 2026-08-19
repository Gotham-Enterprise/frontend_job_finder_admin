/**
 * Eligibility rules for which supervision types a supervisee may request,
 * based solely on their occupation. The occupation dropdown offers only
 * allowlisted supervisee occupations, so the occupation name is an exact
 * signal — no credential-text matching.
 *
 * Keep in sync with:
 *  - frontend_find_supervisor_next `src/lib/utils/supervisee-eligibility.ts`
 *  - backend_job_finder `utils/supervisee-eligibility.js`
 */

export const SUPERVISOR_TYPE_CODES = {
  COLLABORATING_PHYSICIAN: "COLLABORATING_PHYSICIAN",
  SUPERVISING_PHYSICIAN: "SUPERVISING_PHYSICIAN",
  MENTAL_HEALTH_COUNSELORS: "MENTAL_HEALTH_COUNSELORS",
  MEDICAL_DIRECTOR: "MEDICAL_DIRECTOR",
} as const;

/** Fallback when hierarchy entries carry only a display name. */
const SUPERVISOR_TYPE_NAME_TO_CODE: Record<string, string> = {
  "collaborating physician": SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN,
  "supervising physician": SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN,
  "mental health counselors": SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  "supervising mental health counselor": SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  "medical director": SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR,
};

type SupervisorTypeLike = { code?: string; name?: string };

const NURSE_PRACTITIONER_OCCUPATION = "Nurse Practitioner";
const PHYSICIAN_ASSISTANT_OCCUPATION = "Physician Assistant";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * The only occupations a supervisee may sign up under (per product rules):
 * one entry per allowlisted associate/intern-level mental health credential,
 * plus Nurse Practitioners and Physician Assistants. Names must match the
 * backend occupations list — the mental-health entries are supervision-only
 * rows (`isDropdown=false`) seeded by backend_job_finder
 * `prisma/seedSuperviseeOccupations.js`.
 */
export const SUPERVISEE_ALLOWED_OCCUPATIONS = [
  // Mental health — supervised by a Licensed Mental Health Counselor Supervisor.
  // LPCA (KY) and LPC-A (TX) share the "Licensed Professional Counselor Associate" entry.
  // Counseling
  "Associate Professional Counselor",
  "Associate Professional Clinical Counselor",
  "Licensed Mental Health Counselor Associate",
  "Licensed Clinical Mental Health Counselor Associate",
  "Licensed Professional Counselor Associate",
  "Provisional Licensed Professional Counselor",
  "Licensed Associate Counselor",
  "Associate Licensed Counselor",
  "Licensed Associate Professional Counselor",
  "Licensed Graduate Professional Counselor",
  "Licensed Professional Counselor In Training",
  "Registered Mental Health Counselor Intern",
  "Mental Health Counselor, Limited Permit",
  // Marriage & Family Therapy
  "Associate Marriage and Family Therapist",
  "Licensed Marriage and Family Therapist Associate",
  "Licensed Associate Marriage and Family Therapist",
  "Marriage and Family Therapist Intern",
  "Registered Marriage and Family Therapist Intern",
  // Social Work
  "Associate Clinical Social Worker",
  "Clinical Social Work Associate",
  "Licensed Social Worker",
  "Licensed Master Social Worker",
  "Licensed Graduate Social Worker",
  "Licensed Social Worker Associate Independent Clinical",
  // Psychology
  "Licensed Psychological Associate",
  "Psychologist Intern",
  // Healthcare — supervised by a Supervising/Collaborating Physician
  PHYSICIAN_ASSISTANT_OCCUPATION,
  NURSE_PRACTITIONER_OCCUPATION,
] as const;

const ALLOWED_OCCUPATIONS_NORMALIZED = new Set(
  SUPERVISEE_ALLOWED_OCCUPATIONS.map((name) => normalize(name)),
);

/** Allowlisted mental-health occupations (everything except NP and PA). */
const MENTAL_HEALTH_OCCUPATIONS_NORMALIZED = new Set(
  SUPERVISEE_ALLOWED_OCCUPATIONS.filter(
    (name) => name !== PHYSICIAN_ASSISTANT_OCCUPATION && name !== NURSE_PRACTITIONER_OCCUPATION,
  ).map((name) => normalize(name)),
);

export function isAllowedSuperviseeOccupation(occupationName: string): boolean {
  return ALLOWED_OCCUPATIONS_NORMALIZED.has(normalize(occupationName));
}

/**
 * Restricts a supervisee "Occupation" dropdown to `SUPERVISEE_ALLOWED_OCCUPATIONS`.
 * `keep` retains extra options regardless of the allowlist — used on edit forms so a
 * legacy occupation saved before this rule still renders as the selected value.
 */
export function filterSuperviseeOccupationChoices<T extends { label: string }>(
  options: T[],
  keep?: (option: T) => boolean,
): T[] {
  return options.filter((option) => isAllowedSuperviseeOccupation(option.label) || keep?.(option));
}

export function isNursePractitionerOccupation(occupationName: string): boolean {
  return normalize(occupationName) === normalize(NURSE_PRACTITIONER_OCCUPATION);
}

export function isPhysicianAssistantOccupation(occupationName: string): boolean {
  return normalize(occupationName) === normalize(PHYSICIAN_ASSISTANT_OCCUPATION);
}

export function isMentalHealthSuperviseeOccupation(occupationName: string): boolean {
  return MENTAL_HEALTH_OCCUPATIONS_NORMALIZED.has(normalize(occupationName));
}

/** Display name of the Medical Director type as seeded in the backend. */
export const MEDICAL_DIRECTOR_TYPE_NAME = "Medical Director";

export function isMedicalDirectorType(type: SupervisorTypeLike): boolean {
  return resolveSupervisorTypeCode(type) === SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR;
}

export function resolveSupervisorTypeCode(type: SupervisorTypeLike): string {
  if (type.code?.trim()) return type.code.trim().toUpperCase();
  return SUPERVISOR_TYPE_NAME_TO_CODE[normalize(type.name ?? "")] ?? "";
}

/**
 * Whether the supervisee may select the given supervision type.
 * Medical Director is always available; unknown/future types default to available.
 */
export function isSupervisorTypeEligibleForSupervisee(
  type: SupervisorTypeLike,
  occupationName: string,
): boolean {
  switch (resolveSupervisorTypeCode(type)) {
    case SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN:
      return isNursePractitionerOccupation(occupationName);
    case SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN:
      return isPhysicianAssistantOccupation(occupationName);
    case SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS:
      return isMentalHealthSuperviseeOccupation(occupationName);
    case SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR:
      return true;
    default:
      return true;
  }
}

export function getEligibleSupervisorTypes<T extends SupervisorTypeLike>(
  typesData: T[],
  occupationName: string,
): T[] {
  return typesData.filter((type) => isSupervisorTypeEligibleForSupervisee(type, occupationName));
}
