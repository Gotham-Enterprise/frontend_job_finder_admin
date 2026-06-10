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

/** Supervisor types that do not use the certifications field. */
export const SUPERVISOR_TYPES_WITHOUT_CERTIFICATIONS = [
  "Collaborating Physician",
  "Supervising Physician",
] as const;

export function isSupervisorTypeWithoutCertifications(supervisorType: string): boolean {
  return (SUPERVISOR_TYPES_WITHOUT_CERTIFICATIONS as readonly string[]).includes(
    supervisorType,
  );
}

export const SUPERVISOR_CERTIFICATIONS_DISABLED_MESSAGE =
  "Certifications are not required for Collaborating or Supervising Physicians.";

export function getSupervisorCredentialTypeLabel(supervisorType: string): string {
  return isSupervisorTypeWithoutCertifications(supervisorType) ? "Degree Type" : "License Type";
}

export const PHYSICIAN_DEGREE_TYPE_OPTIONS = ["MD", "DO"] as const;

export const physicianDegreeTypeSelectOptions = PHYSICIAN_DEGREE_TYPE_OPTIONS.map((value) => ({
  label: value,
  value,
}));

export function isValidPhysicianDegreeType(value: string): boolean {
  return (PHYSICIAN_DEGREE_TYPE_OPTIONS as readonly string[]).includes(value.trim());
}

type CredentialNameItem = { name: string };

type SupervisorTypeHierarchyOccupation = {
  licenseTypes?: CredentialNameItem[];
  degreeTypes?: CredentialNameItem[];
};

type SupervisorTypeHierarchy = {
  name: string;
  occupations: SupervisorTypeHierarchyOccupation[];
};

export function getSupervisorCredentialSelectOptions(
  selectedType: SupervisorTypeHierarchy | undefined,
  selectedOccupation: SupervisorTypeHierarchyOccupation | undefined,
): { label: string; value: string }[] {
  if (!selectedType) return [];

  if (isSupervisorTypeWithoutCertifications(selectedType.name)) {
    const source =
      selectedOccupation?.degreeTypes?.length
        ? selectedOccupation.degreeTypes
        : selectedType.occupations.find((occupation) => occupation.degreeTypes?.length)
            ?.degreeTypes;

    if (source?.length) {
      return source.map((item) => ({ label: item.name, value: item.name }));
    }

    return [...physicianDegreeTypeSelectOptions];
  }

  if (!selectedOccupation) return [];

  return (selectedOccupation.licenseTypes ?? []).map((item) => ({
    label: item.name,
    value: item.name,
  }));
}
