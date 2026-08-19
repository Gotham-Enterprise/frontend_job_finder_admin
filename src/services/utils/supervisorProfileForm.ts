import {
  ABMS_CERTIFYING_BOARDS,
  MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES,
  type MedicalDirectorOfferingKey,
  OTHER_CERTIFYING_BOARD_VALUE,
  PROFESSIONAL_CREDENTIALS_MAX_LENGTH,
  PROFESSIONAL_CREDENTIALS_PATTERN,
  SUPERVISOR_PROFILE_TEXT_MAX_LENGTH,
  SUPERVISOR_PROFILE_TEXT_MIN_LENGTH,
  SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS,
  isMedicalDirectorSupervisorType,
  isMonthlyOnlySupervisorType,
  isSupervisorTypeWithoutCertifications,
  isValidPhysicianDegreeType,
} from "@/constants/supervisorSignupOptions";
import type {
  SupervisorBoardCertificationPayload,
  SupervisorDetails,
  SupervisorLicenseEntryPayload,
  SupervisorOfferingPayload,
  SupervisorUpdatePayload,
} from "@/services/types/supervisor";
import { formatUSPhoneForDisplay } from "@/services/utils/phoneNumberUtils";
import { resolveStateToAbbreviation } from "./superviseeProfileForm";

export interface SupervisorLicenseEntryFormData {
  licenseType: string;
  licenseNumber: string;
  state: string;
  licenseExpiration: string;
}

export type SupervisorLicenseEntryErrors = Partial<
  Record<keyof SupervisorLicenseEntryFormData, string>
>;

export interface SupervisorOfferingFormData {
  occupation: string;
  specialty: string;
  degreeType: string;
  licenses: SupervisorLicenseEntryFormData[];
}

export interface SupervisorBoardCertificationFormData {
  certifyingBoard: string;
  /** Free-text board name when the select is "Other". */
  certifyingBoardOther: string;
  specialty: string;
  subspecialty: string;
  certificationNumber: string;
  expirationDate: string;
}

export interface SupervisorOfferingErrors {
  occupation?: string;
  degreeType?: string;
  licenses?: string;
  licenseEntries?: SupervisorLicenseEntryErrors[];
}

export type SupervisorBoardCertificationEntryErrors = Partial<
  Record<keyof SupervisorBoardCertificationFormData, string>
>;

export type SupervisorFieldErrors = Partial<
  Record<keyof SupervisorEditFormData | "uploadProfilePhoto" | "uploadLicense", string>
> & {
  /** Per-entry errors for the `licenses` repeater, aligned by index. */
  licenseEntries?: SupervisorLicenseEntryErrors[];
  /** Per-offering errors for the Medical Director offering blocks. */
  offeringErrors?: Partial<Record<MedicalDirectorOfferingKey, SupervisorOfferingErrors>>;
  /** Per-entry errors for the board-certification repeater, aligned by index. */
  boardCertificationEntries?: SupervisorBoardCertificationEntryErrors[];
};

export interface SupervisorEditFormData {
  fullName: string;
  professionalCredentials: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  supervisorType: string;
  occupation: string;
  specialty: string;
  degreeType: string;
  licenses: SupervisorLicenseEntryFormData[];
  yearsOfExperience: string;
  patientPopulation: string[];
  certification: string[];
  supervisionFormat: string;
  availability: string;
  professionalSummary: string;
  describeYourself: string;
  acceptingSupervisees: boolean;
  supervisionFeeType: string;
  supervisionFeeAmount: string;
  // Medical Director only — blank/false for other supervisor types.
  offerSupervisingPhysician: boolean;
  offerCollaboratingPhysician: boolean;
  offerings: Record<MedicalDirectorOfferingKey, SupervisorOfferingFormData>;
  boardCertified: boolean;
  boardCertifications: SupervisorBoardCertificationFormData[];
}

export const emptySupervisorLicenseEntry = (): SupervisorLicenseEntryFormData => ({
  licenseType: "",
  licenseNumber: "",
  state: "",
  licenseExpiration: "",
});

export const emptySupervisorOffering = (): SupervisorOfferingFormData => ({
  occupation: "",
  specialty: "",
  degreeType: "",
  licenses: [emptySupervisorLicenseEntry()],
});

export const emptySupervisorBoardCertification = (): SupervisorBoardCertificationFormData => ({
  certifyingBoard: "",
  certifyingBoardOther: "",
  specialty: "",
  subspecialty: "",
  certificationNumber: "",
  expirationDate: "",
});

function isBlankLicenseEntry(entry: SupervisorLicenseEntryFormData): boolean {
  return (
    !entry.licenseType.trim() &&
    !entry.licenseNumber.trim() &&
    !entry.state.trim() &&
    !entry.licenseExpiration.trim()
  );
}

export function validateSupervisorEditForm(form: SupervisorEditFormData): SupervisorFieldErrors {
  const errors: SupervisorFieldErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  const credentials = form.professionalCredentials.trim();
  if (credentials.length > PROFESSIONAL_CREDENTIALS_MAX_LENGTH) {
    errors.professionalCredentials = `Professional credentials must be ${PROFESSIONAL_CREDENTIALS_MAX_LENGTH} characters or less`;
  } else if (credentials && !PROFESSIONAL_CREDENTIALS_PATTERN.test(credentials)) {
    errors.professionalCredentials =
      "Only letters, numbers, spaces, commas, periods, parentheses, and hyphens are allowed";
  }

  const phoneDigits = form.contactNumber.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    errors.contactNumber = "Contact number is required";
  }

  if (!form.city.trim()) {
    errors.city = "City is required";
  }
  if (!form.state.trim()) {
    errors.state = "State is required";
  }
  if (!form.zipcode.trim()) {
    errors.zipcode = "Zipcode is required";
  }

  if (!form.supervisorType) {
    errors.supervisorType = "Supervisor type is required";
  }
  if (!form.occupation) {
    errors.occupation = "Occupation is required";
  }
  const physicianSupervisor = isSupervisorTypeWithoutCertifications(form.supervisorType);
  if (physicianSupervisor) {
    if (!form.degreeType) {
      errors.degreeType = "Degree type is required";
    } else if (!isValidPhysicianDegreeType(form.degreeType)) {
      errors.degreeType = "Degree type must be MD or DO";
    }
  }

  // Entirely blank entries are dropped from the payload; a partially-filled
  // entry must be complete (each license is tied to its own state). Legacy
  // records without license data can still be saved — the payload then omits
  // `licenses` and the backend leaves license rows untouched.
  const licenseEntries: SupervisorLicenseEntryErrors[] = form.licenses.map((entry) => {
    if (isBlankLicenseEntry(entry)) return {};
    const entryErrors: SupervisorLicenseEntryErrors = {};
    if (!physicianSupervisor && !entry.licenseType.trim()) {
      entryErrors.licenseType = "License type is required";
    }
    if (!entry.licenseNumber.trim()) {
      entryErrors.licenseNumber = "License number is required";
    }
    if (!entry.state.trim()) {
      entryErrors.state = "State is required";
    }
    if (!entry.licenseExpiration.trim()) {
      entryErrors.licenseExpiration = "Expiration date is required";
    }
    return entryErrors;
  });
  if (licenseEntries.some((entryErrors) => Object.keys(entryErrors).length > 0)) {
    errors.licenseEntries = licenseEntries;
    errors.licenses = "Complete or remove the highlighted license entries";
  }

  if (
    isMonthlyOnlySupervisorType(form.supervisorType) &&
    form.supervisionFeeType &&
    form.supervisionFeeType !== "MONTHLY"
  ) {
    errors.supervisionFeeType =
      "Only the Monthly fee type is available for this supervisor type";
  }

  // Medical Director extras — validated only for checked offerings / Board
  // Certified Yes (hidden blocks keep their blank defaults).
  if (isMedicalDirectorSupervisorType(form.supervisorType)) {
    const offeringErrors: SupervisorFieldErrors["offeringErrors"] = {};
    const checkedKeys: MedicalDirectorOfferingKey[] = [];
    if (form.offerSupervisingPhysician) checkedKeys.push("supervising");
    if (form.offerCollaboratingPhysician) checkedKeys.push("collaborating");

    for (const key of checkedKeys) {
      const block = form.offerings[key];
      const blockErrors: SupervisorOfferingErrors = {};
      if (!block.occupation.trim()) {
        blockErrors.occupation = "Occupation is required";
      }
      if (!block.degreeType.trim()) {
        blockErrors.degreeType = "Degree type is required";
      } else if (!isValidPhysicianDegreeType(block.degreeType)) {
        blockErrors.degreeType = "Degree type must be MD or DO";
      }

      const entryErrorsList: SupervisorLicenseEntryErrors[] = block.licenses.map((entry) => {
        if (isBlankLicenseEntry(entry)) return {};
        const entryErrors: SupervisorLicenseEntryErrors = {};
        if (!entry.licenseNumber.trim()) entryErrors.licenseNumber = "License number is required";
        if (!entry.state.trim()) entryErrors.state = "State is required";
        if (!entry.licenseExpiration.trim())
          entryErrors.licenseExpiration = "Expiration date is required";
        return entryErrors;
      });
      const completeEntries = block.licenses.filter((entry) => !isBlankLicenseEntry(entry));
      if (completeEntries.length === 0) {
        blockErrors.licenses = "Add at least one license";
      } else if (entryErrorsList.some((entryErrors) => Object.keys(entryErrors).length > 0)) {
        blockErrors.licenseEntries = entryErrorsList;
        blockErrors.licenses = "Complete or remove the highlighted license entries";
      }

      if (Object.keys(blockErrors).length > 0) {
        offeringErrors[key] = blockErrors;
      }
    }
    if (Object.keys(offeringErrors).length > 0) {
      errors.offeringErrors = offeringErrors;
    }

    if (form.boardCertified) {
      const certErrors: SupervisorBoardCertificationEntryErrors[] =
        form.boardCertifications.map((entry) => {
          const entryErrors: SupervisorBoardCertificationEntryErrors = {};
          if (!entry.certifyingBoard.trim()) {
            entryErrors.certifyingBoard = "Certifying board is required";
          } else if (
            entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE &&
            !entry.certifyingBoardOther.trim()
          ) {
            entryErrors.certifyingBoardOther = "Please enter the certifying board name";
          }
          if (!entry.specialty.trim()) {
            entryErrors.specialty = "Specialty is required";
          }
          return entryErrors;
        });
      if (form.boardCertifications.length === 0) {
        errors.boardCertifications = "Add at least one board certification";
      } else if (certErrors.some((entryErrors) => Object.keys(entryErrors).length > 0)) {
        errors.boardCertificationEntries = certErrors;
        errors.boardCertifications = "Complete the highlighted certifications";
      }
    }
  }

  if (!form.professionalSummary.trim()) {
    errors.professionalSummary = "Professional summary is required";
  } else if (form.professionalSummary.trim().length < SUPERVISOR_PROFILE_TEXT_MIN_LENGTH) {
    errors.professionalSummary = `Professional summary must be at least ${SUPERVISOR_PROFILE_TEXT_MIN_LENGTH} characters`;
  } else if (form.professionalSummary.length > SUPERVISOR_PROFILE_TEXT_MAX_LENGTH) {
    errors.professionalSummary = `Professional summary must be ${SUPERVISOR_PROFILE_TEXT_MAX_LENGTH} characters or less`;
  }

  if (!form.describeYourself.trim()) {
    errors.describeYourself = "About is required";
  } else if (form.describeYourself.trim().length < SUPERVISOR_PROFILE_TEXT_MIN_LENGTH) {
    errors.describeYourself = `About must be at least ${SUPERVISOR_PROFILE_TEXT_MIN_LENGTH} characters`;
  } else if (form.describeYourself.length > SUPERVISOR_PROFILE_TEXT_MAX_LENGTH) {
    errors.describeYourself = `About must be ${SUPERVISOR_PROFILE_TEXT_MAX_LENGTH} characters or less`;
  }

  return errors;
}

/**
 * Prefilled license entries plus per-entry "needs review" flags, aligned by
 * index. Entries come from the profile's license rows; unmigrated legacy
 * records fall back to the flat mirror columns, and each licensed state
 * without a license row appends a mostly-blank entry so state coverage is
 * visible to the admin.
 */
export function getSupervisorLicenseEntryDefaults(details: SupervisorDetails): {
  entries: SupervisorLicenseEntryFormData[];
  entriesNeedingReview: boolean[];
} {
  const profile = details.supervisorProfile;
  const physicianSupervisor = isSupervisorTypeWithoutCertifications(profile?.supervisorType ?? "");
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");

  const rows = profile?.licenses ?? [];
  const entries: SupervisorLicenseEntryFormData[] = rows.map((row) => ({
    licenseType: physicianSupervisor ? "" : row.licenseType ?? "",
    licenseNumber: row.licenseNumber ?? "",
    state: row.state ?? "",
    licenseExpiration: toDateInput(row.licenseExpiration),
  }));
  const entriesNeedingReview = rows.map(
    (row) => Boolean(row.needsReview) || !row.state?.trim() || !row.licenseNumber?.trim(),
  );

  // Unmigrated legacy record: synthesize one entry from the flat mirror columns.
  if (entries.length === 0 && profile?.licenseNumber?.trim()) {
    entries.push({
      licenseType: physicianSupervisor ? "" : profile.licenseType ?? "",
      licenseNumber: profile.licenseNumber,
      state: profile.stateLicense ?? "",
      licenseExpiration: toDateInput(profile.licenseExpiration),
    });
    entriesNeedingReview.push(!profile.stateLicense?.trim());
  }

  const coveredStates = new Set(entries.map((entry) => entry.state).filter(Boolean));
  for (const state of details.stateOfLicensure ?? []) {
    if (!state || coveredStates.has(state)) continue;
    coveredStates.add(state);
    entries.push({ ...emptySupervisorLicenseEntry(), state });
    entriesNeedingReview.push(true);
  }

  if (entries.length === 0) {
    entries.push(emptySupervisorLicenseEntry());
    entriesNeedingReview.push(false);
  }

  return { entries, entriesNeedingReview };
}

/** Stored offering rows → checkbox flags + keyed credential blocks. */
export function getSupervisorOfferingDefaults(details: SupervisorDetails): {
  offerSupervisingPhysician: boolean;
  offerCollaboratingPhysician: boolean;
  offerings: Record<MedicalDirectorOfferingKey, SupervisorOfferingFormData>;
} {
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");
  const blocks: Record<MedicalDirectorOfferingKey, SupervisorOfferingFormData> = {
    supervising: emptySupervisorOffering(),
    collaborating: emptySupervisorOffering(),
  };
  const flags = { supervising: false, collaborating: false };

  for (const offering of details.supervisorProfile?.offerings ?? []) {
    const key = (
      Object.entries(MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES) as [MedicalDirectorOfferingKey, string][]
    ).find(([, typeName]) => typeName === offering.supervisorType)?.[0];
    if (!key) continue;
    flags[key] = true;
    const licenses = (offering.licenses ?? []).map((license) => ({
      licenseType: "",
      licenseNumber: license.licenseNumber ?? "",
      state: license.state ?? "",
      licenseExpiration: toDateInput(license.licenseExpiration),
    }));
    blocks[key] = {
      occupation: offering.occupation ?? "",
      specialty: offering.specialty ?? "",
      degreeType: offering.degreeType ?? "",
      licenses: licenses.length > 0 ? licenses : [emptySupervisorLicenseEntry()],
    };
  }

  return {
    offerSupervisingPhysician: flags.supervising,
    offerCollaboratingPhysician: flags.collaborating,
    offerings: blocks,
  };
}

/** Stored board-certification rows → Yes/No flag + entries ("Other" detected against the ABMS list). */
export function getSupervisorBoardCertificationDefaults(details: SupervisorDetails): {
  boardCertified: boolean;
  boardCertifications: SupervisorBoardCertificationFormData[];
} {
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");
  const rows = details.supervisorProfile?.boardCertifications ?? [];

  const entries: SupervisorBoardCertificationFormData[] = rows.map((row) => {
    const isKnownBoard = (ABMS_CERTIFYING_BOARDS as readonly string[]).includes(
      row.certifyingBoard,
    );
    return {
      certifyingBoard: isKnownBoard ? row.certifyingBoard : OTHER_CERTIFYING_BOARD_VALUE,
      certifyingBoardOther: isKnownBoard ? "" : row.certifyingBoard,
      specialty: row.specialty ?? "",
      subspecialty: row.subspecialty ?? "",
      certificationNumber: row.certificationNumber ?? "",
      expirationDate: toDateInput(row.expirationDate),
    };
  });

  return {
    boardCertified: entries.length > 0,
    boardCertifications: entries.length > 0 ? entries : [emptySupervisorBoardCertification()],
  };
}

export function mapSupervisorDetailsToFormData(
  details: SupervisorDetails,
  states: { abbreviation: string; name: string }[] = [],
): SupervisorEditFormData {
  const profile = details.supervisorProfile;

  const physicianSupervisor = isSupervisorTypeWithoutCertifications(profile?.supervisorType ?? "");

  return {
    fullName: details.fullName ?? "",
    professionalCredentials: profile?.professionalCredentials ?? "",
    contactNumber: details.contactNumber
      ? formatUSPhoneForDisplay(details.contactNumber)
      : "",
    city: details.city ?? "",
    state: resolveStateToAbbreviation(details.state, states),
    zipcode: details.zipcode ?? "",
    supervisorType: profile?.supervisorType ?? "",
    occupation: profile?.occupation ?? details.supervisorOccupation ?? "",
    specialty: profile?.specialty ?? details.supervisorSpecialty ?? "",
    degreeType: physicianSupervisor
      ? profile?.degreeType ?? profile?.licenseType ?? ""
      : "",
    licenses: getSupervisorLicenseEntryDefaults(details).entries,
    yearsOfExperience: (() => {
      const raw = profile?.yearsOfExperience?.trim() ?? "";
      return (SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS as readonly string[]).includes(raw)
        ? raw
        : "";
    })(),
    patientPopulation: profile?.patientPopulation ?? [],
    certification: isSupervisorTypeWithoutCertifications(profile?.supervisorType ?? "")
      ? []
      : profile?.certification ?? [],
    supervisionFormat: profile?.supervisionFormat ?? "",
    availability: profile?.availability ?? "",
    professionalSummary: profile?.professionalSummary ?? "",
    describeYourself: profile?.describeYourself ?? "",
    acceptingSupervisees: profile?.acceptingSupervisees ?? false,
    supervisionFeeType: profile?.supervisionFeeType ?? "",
    supervisionFeeAmount:
      profile?.supervisionFeeAmount != null ? String(profile.supervisionFeeAmount) : "",
    ...getSupervisorOfferingDefaults(details),
    ...getSupervisorBoardCertificationDefaults(details),
  };
}

export function buildSupervisorUpdateFormData(payload: SupervisorUpdatePayload): FormData {
  const fd = new FormData();
  const {
    uploadProfilePhoto,
    uploadLicense,
    licenses,
    offerings,
    boardCertifications,
    patientPopulation,
    certification,
    acceptingSupervisees,
    professionalCredentials,
    ...rest
  } = payload;

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, String(value));
    }
  }

  if (acceptingSupervisees !== undefined) {
    fd.append("acceptingSupervisees", String(acceptingSupervisees));
  }

  // Sent even when empty so the backend can clear the optional value.
  if (professionalCredentials !== undefined) {
    fd.append("professionalCredentials", professionalCredentials);
  }

  // Single JSON field (nested objects are unreliable via multipart bracket
  // keys); the backend replaces all license rows and re-derives
  // stateOfLicensure from them.
  if (licenses) {
    fd.append("licenses", JSON.stringify(licenses));
  }

  // Full replace — an empty array clears the rows, so key on presence.
  if (offerings !== undefined) {
    fd.append("offerings", JSON.stringify(offerings));
  }
  if (boardCertifications !== undefined) {
    fd.append("boardCertifications", JSON.stringify(boardCertifications));
  }

  patientPopulation?.forEach((p) => fd.append("patientPopulation[]", p));
  certification?.forEach((c) => fd.append("certification[]", c));

  if (uploadProfilePhoto) {
    fd.append("uploadProfilePhoto", uploadProfilePhoto);
  }
  if (uploadLicense) {
    fd.append("uploadLicense", uploadLicense);
  }

  return fd;
}

export function formDataToUpdatePayload(
  form: SupervisorEditFormData,
  uploadProfilePhoto?: File,
  uploadLicense?: File,
): SupervisorUpdatePayload {
  const contactDigits = form.contactNumber.replace(/\D/g, "");

  return {
    fullName: form.fullName.trim() || undefined,
    // Always sent (empty string clears the stored value on the backend).
    professionalCredentials: form.professionalCredentials.trim(),
    contactNumber: contactDigits || form.contactNumber.trim() || undefined,
    city: form.city.trim() || undefined,
    state: form.state.trim() || undefined,
    zipcode: form.zipcode.trim() || undefined,
    supervisorType: form.supervisorType || undefined,
    occupation: form.occupation || null,
    specialty: form.specialty || null,
    ...(isSupervisorTypeWithoutCertifications(form.supervisorType)
      ? { degreeType: form.degreeType || undefined }
      : {}),
    licenses: (() => {
      const physicianSupervisor = isSupervisorTypeWithoutCertifications(form.supervisorType);
      const complete = form.licenses
        .filter((entry) => !isBlankLicenseEntry(entry))
        .map<SupervisorLicenseEntryPayload>((entry) => ({
          ...(physicianSupervisor ? {} : { licenseType: entry.licenseType.trim() }),
          licenseNumber: entry.licenseNumber.trim(),
          state: entry.state.trim(),
          licenseExpiration: entry.licenseExpiration,
        }));
      // Omit when no complete entries: the backend then leaves license rows
      // untouched (legacy records without license data stay editable).
      return complete.length ? complete : undefined;
    })(),
    yearsOfExperience: form.yearsOfExperience || undefined,
    patientPopulation: form.patientPopulation.length ? form.patientPopulation : undefined,
    certification: isSupervisorTypeWithoutCertifications(form.supervisorType)
      ? []
      : form.certification.length
        ? form.certification
        : undefined,
    supervisionFormat: form.supervisionFormat || undefined,
    availability: form.availability || undefined,
    professionalSummary: form.professionalSummary.trim() || undefined,
    describeYourself: form.describeYourself.trim() || undefined,
    acceptingSupervisees: form.acceptingSupervisees,
    supervisionFeeType: form.supervisionFeeType || undefined,
    supervisionFeeAmount:
      form.supervisionFeeAmount !== "" ? parseInt(form.supervisionFeeAmount, 10) : undefined,
    uploadProfilePhoto,
    uploadLicense,
    // Medical Director only: full replace — unchecked boxes / "No" send empty
    // arrays so removed offerings/certifications are cleared server-side.
    ...(isMedicalDirectorSupervisorType(form.supervisorType)
      ? {
          offerings: buildSupervisorOfferingsPayload(form),
          boardCertifications: buildSupervisorBoardCertificationsPayload(form),
        }
      : {}),
  };
}

/** One payload entry per CHECKED offering; blank license entries are dropped. */
export function buildSupervisorOfferingsPayload(
  form: SupervisorEditFormData,
): SupervisorOfferingPayload[] {
  const checkedKeys: MedicalDirectorOfferingKey[] = [];
  if (form.offerSupervisingPhysician) checkedKeys.push("supervising");
  if (form.offerCollaboratingPhysician) checkedKeys.push("collaborating");

  return checkedKeys.map((key) => {
    const block = form.offerings[key];
    return {
      supervisorType: MEDICAL_DIRECTOR_OFFERING_TYPE_NAMES[key],
      occupation: block.occupation.trim(),
      ...(block.specialty.trim() ? { specialty: block.specialty.trim() } : {}),
      degreeType: block.degreeType.trim(),
      licenses: block.licenses
        .filter((entry) => !isBlankLicenseEntry(entry))
        .map((entry) => ({
          licenseNumber: entry.licenseNumber.trim(),
          state: entry.state.trim(),
          licenseExpiration: entry.licenseExpiration,
        })),
    };
  });
}

/** One payload entry per certification when Board Certified is Yes; "Other" resolves to the free text. */
export function buildSupervisorBoardCertificationsPayload(
  form: SupervisorEditFormData,
): SupervisorBoardCertificationPayload[] {
  if (!form.boardCertified) return [];

  return form.boardCertifications.map((entry) => ({
    certifyingBoard:
      entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE
        ? entry.certifyingBoardOther.trim()
        : entry.certifyingBoard,
    specialty: entry.specialty.trim(),
    ...(entry.subspecialty.trim() ? { subspecialty: entry.subspecialty.trim() } : {}),
    ...(entry.certificationNumber.trim()
      ? { certificationNumber: entry.certificationNumber.trim() }
      : {}),
    ...(entry.expirationDate.trim() ? { expirationDate: entry.expirationDate } : {}),
  }));
}

export const SUPERVISION_FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
};

export const SUPERVISION_FEE_TYPE_LABELS: Record<string, string> = {
  HOURLY: "Hourly",
  MONTHLY: "Monthly",
};
