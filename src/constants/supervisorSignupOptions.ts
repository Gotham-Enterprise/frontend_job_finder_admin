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

/** Post-nominal letters after the name, e.g. "Ph.D., NCC, LPC-S (AL)" — mirrors the backend validator. */
export const PROFESSIONAL_CREDENTIALS_MAX_LENGTH = 150;
export const PROFESSIONAL_CREDENTIALS_PATTERN = /^[A-Za-z0-9 .,()-]*$/;
export const PROFESSIONAL_CREDENTIALS_HELPER_TEXT =
  "Enter degrees, licenses, and certifications that appear after your name. Example: Ph.D., NCC, LPC-S (AL), LPC (MI)";

/** Supervisor types that do not use the certifications field. */
export const SUPERVISOR_TYPES_WITHOUT_CERTIFICATIONS = [
  "Collaborating Physician",
  "Supervising Physician",
  "Medical Director",
] as const;

export function isSupervisorTypeWithoutCertifications(supervisorType: string): boolean {
  return (SUPERVISOR_TYPES_WITHOUT_CERTIFICATIONS as readonly string[]).includes(
    supervisorType,
  );
}

/** Supervisor types restricted to the MONTHLY supervision fee type. */
export const MONTHLY_ONLY_SUPERVISOR_TYPES = ["Medical Director"] as const;

export function isMonthlyOnlySupervisorType(supervisorType: string): boolean {
  return (MONTHLY_ONLY_SUPERVISOR_TYPES as readonly string[]).includes(supervisorType);
}

export const MEDICAL_DIRECTOR_TYPE_NAME = "Medical Director";

export function isMedicalDirectorSupervisorType(supervisorType: string): boolean {
  return supervisorType.trim() === MEDICAL_DIRECTOR_TYPE_NAME;
}

/** Secondary service types a Medical Director may additionally offer (form key → type name). */
export const MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES = {
  supervising: "Supervising Physician",
  collaborating: "Collaborating Physician",
} as const;

export type MedicalDirectorOfferingKey = keyof typeof MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES;

/** Same list as frontend_find_supervisor_next `lib/utils/board-certification.ts` — the 24 ABMS member boards. */
export const ABMS_CERTIFYING_BOARDS = [
  "American Board of Allergy and Immunology",
  "American Board of Anesthesiology",
  "American Board of Colon and Rectal Surgery",
  "American Board of Dermatology",
  "American Board of Emergency Medicine",
  "American Board of Family Medicine",
  "American Board of Internal Medicine",
  "American Board of Medical Genetics and Genomics",
  "American Board of Neurological Surgery",
  "American Board of Nuclear Medicine",
  "American Board of Obstetrics and Gynecology",
  "American Board of Ophthalmology",
  "American Board of Orthopaedic Surgery",
  "American Board of Otolaryngology – Head and Neck Surgery",
  "American Board of Pathology",
  "American Board of Pediatrics",
  "American Board of Physical Medicine and Rehabilitation",
  "American Board of Plastic Surgery",
  "American Board of Preventive Medicine",
  "American Board of Psychiatry and Neurology",
  "American Board of Radiology",
  "American Board of Surgery",
  "American Board of Thoracic Surgery",
  "American Board of Urology",
] as const;

/** Selecting Other reveals a free-text input (e.g. AOA/osteopathic boards). */
export const OTHER_CERTIFYING_BOARD_VALUE = "Other";

export const certifyingBoardSelectOptions = [
  ...ABMS_CERTIFYING_BOARDS.map((board) => ({ label: board, value: board })),
  { label: "Other", value: OTHER_CERTIFYING_BOARD_VALUE },
];

export const SUPERVISOR_CERTIFICATIONS_DISABLED_MESSAGE =
  "Certifications are not required for Collaborating Physicians, Supervising Physicians, or Medical Directors.";

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
