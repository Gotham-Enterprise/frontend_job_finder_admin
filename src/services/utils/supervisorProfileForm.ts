import {
  SUPERVISOR_PROFILE_TEXT_MAX_LENGTH,
  SUPERVISOR_PROFILE_TEXT_MIN_LENGTH,
  SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS,
} from "@/constants/supervisorSignupOptions";
import type { SupervisorDetails, SupervisorUpdatePayload } from "@/services/types/supervisor";
import { formatUSPhoneForDisplay } from "@/services/utils/phoneNumberUtils";
import { resolveStateToAbbreviation } from "./superviseeProfileForm";

export type SupervisorFieldErrors = Partial<
  Record<keyof SupervisorEditFormData | "uploadProfilePhoto" | "uploadLicense", string>
>;

export interface SupervisorEditFormData {
  fullName: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  supervisorType: string;
  occupation: string;
  specialty: string;
  licenseType: string;
  licenseNumber: string;
  licenseExpiration: string;
  yearsOfExperience: string;
  stateOfLicensure: string[];
  patientPopulation: string[];
  certification: string[];
  supervisionFormat: string;
  availability: string;
  professionalSummary: string;
  describeYourself: string;
  acceptingSupervisees: boolean;
  supervisionFeeType: string;
  supervisionFeeAmount: string;
}

export function validateSupervisorEditForm(form: SupervisorEditFormData): SupervisorFieldErrors {
  const errors: SupervisorFieldErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
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
  if (!form.licenseType) {
    errors.licenseType = "License type is required";
  }
  if (!form.stateOfLicensure.length) {
    errors.stateOfLicensure = "At least one state of licensure is required";
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

export function mapSupervisorDetailsToFormData(
  details: SupervisorDetails,
  states: { abbreviation: string; name: string }[] = [],
): SupervisorEditFormData {
  const profile = details.supervisorProfile;

  return {
    fullName: details.fullName ?? "",
    contactNumber: details.contactNumber
      ? formatUSPhoneForDisplay(details.contactNumber)
      : "",
    city: details.city ?? "",
    state: resolveStateToAbbreviation(details.state, states),
    zipcode: details.zipcode ?? "",
    supervisorType: profile?.supervisorType ?? "",
    occupation: profile?.occupation ?? details.supervisorOccupation ?? "",
    specialty: profile?.specialty ?? details.supervisorSpecialty ?? "",
    licenseType: profile?.licenseType ?? "",
    licenseNumber: profile?.licenseNumber ?? "",
    licenseExpiration: profile?.licenseExpiration
      ? profile.licenseExpiration.slice(0, 10)
      : "",
    yearsOfExperience: (() => {
      const raw = profile?.yearsOfExperience?.trim() ?? "";
      return (SUPERVISOR_YEARS_OF_EXPERIENCE_OPTIONS as readonly string[]).includes(raw)
        ? raw
        : "";
    })(),
    stateOfLicensure: details.stateOfLicensure ?? [],
    patientPopulation: profile?.patientPopulation ?? [],
    certification: profile?.certification ?? [],
    supervisionFormat: profile?.supervisionFormat ?? "",
    availability: profile?.availability ?? "",
    professionalSummary: profile?.professionalSummary ?? "",
    describeYourself: profile?.describeYourself ?? "",
    acceptingSupervisees: profile?.acceptingSupervisees ?? false,
    supervisionFeeType: profile?.supervisionFeeType ?? "",
    supervisionFeeAmount:
      profile?.supervisionFeeAmount != null ? String(profile.supervisionFeeAmount) : "",
  };
}

export function buildSupervisorUpdateFormData(payload: SupervisorUpdatePayload): FormData {
  const fd = new FormData();
  const {
    uploadProfilePhoto,
    uploadLicense,
    stateOfLicensure,
    patientPopulation,
    certification,
    acceptingSupervisees,
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

  stateOfLicensure?.forEach((s) => fd.append("stateOfLicensure[]", s));
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
    contactNumber: contactDigits || form.contactNumber.trim() || undefined,
    city: form.city.trim() || undefined,
    state: form.state.trim() || undefined,
    zipcode: form.zipcode.trim() || undefined,
    supervisorType: form.supervisorType || undefined,
    occupation: form.occupation || null,
    specialty: form.specialty || null,
    licenseType: form.licenseType || undefined,
    licenseNumber: form.licenseNumber.trim() || undefined,
    licenseExpiration: form.licenseExpiration || undefined,
    yearsOfExperience: form.yearsOfExperience || undefined,
    stateOfLicensure: form.stateOfLicensure.length ? form.stateOfLicensure : undefined,
    patientPopulation: form.patientPopulation.length ? form.patientPopulation : undefined,
    certification: form.certification.length ? form.certification : undefined,
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
  };
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
