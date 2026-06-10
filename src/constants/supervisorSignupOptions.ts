/** Same values as frontend_find_supervisor_next `components/Signup/schema.ts`. */
export const SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS = [
  "0 – 2 years",
  "2 – 5 years",
  "5 – 10 years",
  "10 – 15 years",
  "15+ years",
] as const;

export const supervisorYearsOfExperienceSelectOptions =
  SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS.map((value) => ({
    label: value,
    value,
  }));

export const SUPERVISOR_PROFILE_TEXT_MIN_LENGTH = 20;
export const SUPERVISOR_PROFILE_TEXT_MAX_LENGTH = 500;
