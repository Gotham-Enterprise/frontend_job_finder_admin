import type { SuperviseeDetails, SuperviseeUpdatePayload } from "@/services/types/supervisee";
import { formatUSPhoneForDisplay } from "@/services/utils/phoneNumberUtils";

export type SuperviseeFieldErrors = Partial<
  Record<keyof SuperviseeEditFormData | "uploadProfilePhoto", string>
>;

export function validateSuperviseeEditForm(form: SuperviseeEditFormData): SuperviseeFieldErrors {
  const errors: SuperviseeFieldErrors = {};

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

  if (!form.occupation) {
    errors.occupation = "Occupation is required";
  }
  if (!form.title.trim()) {
    errors.title = "Credential or license type is required";
  }
  if (!form.stateOfLicensure.length) {
    errors.stateOfLicensure = "At least one state of licensure is required";
  }

  if (!form.typeOfSupervisorNeeded) {
    errors.typeOfSupervisorNeeded = "Type of supervision is required";
  }
  if (!form.superviseeOccupation) {
    errors.superviseeOccupation = "Occupation is required";
  }
  if (!form.howSoonLooking) {
    errors.howSoonLooking = "Please select how soon you need supervision";
  }
  if (form.howSoonLooking === "CUSTOM_DATE" && !form.lookingDate) {
    errors.lookingDate = "Please select a date";
  }
  if (!form.preferredFormat) {
    errors.preferredFormat = "Preferred format is required";
  }
  if (!form.availability) {
    errors.availability = "Availability is required";
  }
  if (!form.budgetRangeType) {
    errors.budgetRangeType = "Budget type is required";
  }
  if (form.budgetRangeStart === "") {
    errors.budgetRangeStart = "Budget start is required";
  }
  if (form.budgetRangeEnd === "") {
    errors.budgetRangeEnd = "Budget end is required";
  }
  if (!form.stateTheyAreLookingIn.length) {
    errors.stateTheyAreLookingIn = "Select at least one state you are looking in";
  }
  if (!form.idealSupervisor.trim()) {
    errors.idealSupervisor = "Description of ideal supervisor is required";
  } else if (form.idealSupervisor.trim().length < 20) {
    errors.idealSupervisor = "Description must be at least 20 characters";
  }

  return errors;
}

export interface SuperviseeEditFormData {
  fullName: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  occupation: string;
  specialty: string;
  title: string;
  stateOfLicensure: string[];
  typeOfSupervisorNeeded: string;
  superviseeOccupation: string;
  superviseeSpecialty: string;
  howSoonLooking: string;
  lookingDate: string;
  preferredFormat: string;
  availability: string;
  idealSupervisor: string;
  stateTheyAreLookingIn: string[];
  budgetRangeType: string;
  budgetRangeStart: string;
  budgetRangeEnd: string;
}

export function resolveStateToAbbreviation(
  raw: string | null | undefined,
  states: { abbreviation: string; name: string }[],
): string {
  if (!raw?.trim()) return "";
  const trimmed = raw.trim();
  if (states.some((s) => s.abbreviation === trimmed)) return trimmed;
  const byName = states.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  return byName?.abbreviation ?? trimmed;
}

export function coerceStringList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  const trimmed = String(value).trim();
  return trimmed ? [trimmed] : [];
}

export function mapSuperviseeDetailsToFormData(
  details: SuperviseeDetails,
  states: { abbreviation: string; name: string }[] = [],
): SuperviseeEditFormData {
  const profile = details.superviseeProfile;
  const occupationId = details.occupationId ?? details.occupation?.id ?? "";
  const specialtyId = details.specialtyId ?? details.specialty?.id ?? "";

  return {
    fullName: details.fullName ?? "",
    contactNumber: details.contactNumber
      ? formatUSPhoneForDisplay(details.contactNumber)
      : "",
    city: details.city ?? "",
    state: resolveStateToAbbreviation(details.state, states),
    zipcode: details.zipcode ?? "",
    occupation: occupationId ? String(occupationId) : "",
    specialty: specialtyId ? String(specialtyId) : "",
    title: profile?.title ?? "",
    stateOfLicensure: details.stateOfLicensure ?? [],
    typeOfSupervisorNeeded: coerceStringList(profile?.typeOfSupervisorNeeded)[0] ?? "",
    superviseeOccupation: profile?.superviseeOccupation ?? "",
    superviseeSpecialty: profile?.superviseeSpecialty ?? "",
    howSoonLooking: profile?.howSoonLooking ?? "",
    lookingDate: profile?.lookingDate ? profile.lookingDate.slice(0, 10) : "",
    preferredFormat: profile?.preferredFormat ?? "",
    availability: profile?.availability ?? "",
    idealSupervisor: profile?.idealSupervisor ?? "",
    stateTheyAreLookingIn: profile?.stateTheyAreLookingIn ?? [],
    budgetRangeType: profile?.budgetRangeType ?? "",
    budgetRangeStart:
      profile?.budgetRangeStart != null ? String(profile.budgetRangeStart) : "",
    budgetRangeEnd: profile?.budgetRangeEnd != null ? String(profile.budgetRangeEnd) : "",
  };
}

export function buildSuperviseeUpdateFormData(
  payload: SuperviseeUpdatePayload,
): FormData {
  const fd = new FormData();
  const {
    uploadProfilePhoto,
    stateOfLicensure,
    typeOfSupervisorNeeded,
    stateTheyAreLookingIn,
    budgetRangeStart,
    budgetRangeEnd,
    ...rest
  } = payload;

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, String(value));
    }
  }

  if (budgetRangeStart !== undefined) {
    fd.append("budgetRangeStart", String(budgetRangeStart));
  }
  if (budgetRangeEnd !== undefined) {
    fd.append("budgetRangeEnd", String(budgetRangeEnd));
  }

  stateOfLicensure?.forEach((s) => fd.append("stateOfLicensure[]", s));
  typeOfSupervisorNeeded?.forEach((t) => fd.append("typeOfSupervisorNeeded[]", t));
  stateTheyAreLookingIn?.forEach((s) => fd.append("stateTheyAreLookingIn[]", s));

  if (uploadProfilePhoto) {
    fd.append("uploadProfilePhoto", uploadProfilePhoto);
  }

  return fd;
}

export function formDataToUpdatePayload(
  form: SuperviseeEditFormData,
  uploadProfilePhoto?: File,
): SuperviseeUpdatePayload {
  const contactDigits = form.contactNumber.replace(/\D/g, "");

  return {
    fullName: form.fullName.trim() || undefined,
    contactNumber: contactDigits || form.contactNumber.trim() || undefined,
    city: form.city.trim() || undefined,
    state: form.state.trim() || undefined,
    zipcode: form.zipcode.trim() || undefined,
    occupation: form.occupation || undefined,
    specialty: form.specialty || undefined,
    title: form.title.trim() || undefined,
    stateOfLicensure: form.stateOfLicensure.length ? form.stateOfLicensure : undefined,
    typeOfSupervisorNeeded: form.typeOfSupervisorNeeded
      ? [form.typeOfSupervisorNeeded]
      : undefined,
    superviseeOccupation: form.superviseeOccupation.trim() || undefined,
    superviseeSpecialty: form.superviseeSpecialty.trim() || undefined,
    howSoonLooking: form.howSoonLooking || undefined,
    lookingDate:
      form.howSoonLooking === "CUSTOM_DATE" ? form.lookingDate || undefined : undefined,
    preferredFormat: form.preferredFormat || undefined,
    availability: form.availability || undefined,
    idealSupervisor: form.idealSupervisor.trim() || undefined,
    stateTheyAreLookingIn: form.stateTheyAreLookingIn.length
      ? form.stateTheyAreLookingIn
      : undefined,
    budgetRangeType: form.budgetRangeType || undefined,
    budgetRangeStart: form.budgetRangeStart !== "" ? parseInt(form.budgetRangeStart, 10) : undefined,
    budgetRangeEnd: form.budgetRangeEnd !== "" ? parseInt(form.budgetRangeEnd, 10) : undefined,
    uploadProfilePhoto,
  };
}

export const HOW_SOON_LABELS: Record<string, string> = {
  IMMEDIATELY: "Immediately",
  WITHIN_2_WEEKS: "Within 2 weeks",
  WITHIN_1_MONTH: "Within 1 month",
  WITHIN_2_MONTHS: "Within 2 months",
  WITHIN_6_MONTHS: "Within 6 months",
  CUSTOM_DATE: "Custom date",
};

export const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
};

export const BUDGET_TYPE_LABELS: Record<string, string> = {
  PER_SESSION: "Per Session",
  MONTHLY: "Monthly",
};
