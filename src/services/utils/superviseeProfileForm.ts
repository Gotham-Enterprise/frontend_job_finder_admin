import type { SuperviseeDetails, SuperviseeUpdatePayload } from "@/services/types/supervisee";
import { formatUSPhoneForDisplay } from "@/services/utils/phoneNumberUtils";
import {
  isMedicalDirectorType,
  MEDICAL_DIRECTOR_TYPE_NAME,
} from "@/services/utils/superviseeEligibility";

export const SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH = 500;

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
  if (!form.licensureState.trim()) {
    errors.licensureState = "State of licensure is required";
  }
  if (!form.stateOfLicensure.length) {
    errors.stateOfLicensure = "At least one state of licensure is required";
  }

  if (!form.typeOfSupervisorNeeded && !form.needsMedicalDirector) {
    errors.typeOfSupervisorNeeded =
      'Select a type of supervision or check "Needs a Medical Director"';
  }
  // The occupation cascades from the type — a Medical Director-only request has none.
  if (form.typeOfSupervisorNeeded && !form.superviseeOccupation) {
    errors.superviseeOccupation = "Occupation is required";
  }
  // Supervision-only preferences — hidden (and skipped) for an MD-only profile.
  if (form.typeOfSupervisorNeeded && !form.howSoonLooking) {
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
  if (form.typeOfSupervisorNeeded) {
    if (!form.budgetRangeType) {
      errors.budgetRangeType = "Budget type is required";
    }
    // Monthly budgets are a single amount (stored in budgetRangeEnd; start is 0)
    if (form.budgetRangeType !== "MONTHLY" && form.budgetRangeStart === "") {
      errors.budgetRangeStart = "Budget start is required";
    }
    if (form.budgetRangeEnd === "") {
      errors.budgetRangeEnd =
        form.budgetRangeType === "MONTHLY"
          ? "Monthly budget is required"
          : "Budget end is required";
    }
  }
  // Medical Director need — its own required block (md* columns).
  if (form.needsMedicalDirector) {
    if (!form.mdHowSoonLooking) {
      errors.mdHowSoonLooking = "Please select how soon a medical director is needed";
    }
    if (form.mdHowSoonLooking === "CUSTOM_DATE" && !form.mdLookingDate) {
      errors.mdLookingDate = "Please select a date";
    }
    const mdBudget = form.mdMonthlyBudget === "" ? NaN : Number(form.mdMonthlyBudget);
    if (!Number.isFinite(mdBudget) || mdBudget < 1) {
      errors.mdMonthlyBudget = "Monthly budget for the medical director is required";
    }
    if (!form.mdIdealDescription.trim()) {
      errors.mdIdealDescription = "Description of ideal medical director is required";
    } else if (form.mdIdealDescription.trim().length < 20) {
      errors.mdIdealDescription = "Description must be at least 20 characters";
    } else if (form.mdIdealDescription.length > SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH) {
      errors.mdIdealDescription = `Description must be ${SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH} characters or less`;
    }
  }
  if (form.introduction.length > SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH) {
    errors.introduction = `Introduction must be ${SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH} characters or less`;
  }
  if (!form.idealSupervisor.trim()) {
    errors.idealSupervisor = "Description of ideal supervisor is required";
  } else if (form.idealSupervisor.trim().length < 20) {
    errors.idealSupervisor = "Description must be at least 20 characters";
  } else if (form.idealSupervisor.length > SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH) {
    errors.idealSupervisor = `Description must be ${SUPERVISEE_IDEAL_SUPERVISOR_MAX_LENGTH} characters or less`;
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
  licensureState: string;
  stateOfLicensure: string[];
  typeOfSupervisorNeeded: string;
  /** Medical Director is a checkbox — it can combine with any type or stand alone. */
  needsMedicalDirector: boolean;
  superviseeOccupation: string;
  superviseeSpecialty: string;
  howSoonLooking: string;
  lookingDate: string;
  preferredFormat: string;
  availability: string;
  idealSupervisor: string;
  budgetRangeType: string;
  budgetRangeStart: string;
  budgetRangeEnd: string;
  mdPreferredOccupation: string;
  mdPreferredSpecialty: string;
  mdHowSoonLooking: string;
  mdLookingDate: string;
  mdMonthlyBudget: string;
  mdIdealDescription: string;
  introduction: string;
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
    licensureState: profile?.licensureState ?? "",
    stateOfLicensure: details.stateOfLicensure ?? [],
    // The stored array holds at most one supervision type plus, optionally, Medical
    // Director — split back into the dropdown value and the checkbox.
    typeOfSupervisorNeeded:
      coerceStringList(profile?.typeOfSupervisorNeeded).find(
        (name) => !isMedicalDirectorType({ name }),
      ) ?? "",
    needsMedicalDirector: coerceStringList(profile?.typeOfSupervisorNeeded).some((name) =>
      isMedicalDirectorType({ name }),
    ),
    superviseeOccupation: profile?.superviseeOccupation ?? "",
    superviseeSpecialty: profile?.superviseeSpecialty ?? "",
    howSoonLooking: profile?.howSoonLooking ?? "",
    lookingDate: profile?.lookingDate ? profile.lookingDate.slice(0, 10) : "",
    preferredFormat: profile?.preferredFormat ?? "",
    availability: profile?.availability ?? "",
    idealSupervisor: profile?.idealSupervisor ?? "",
    budgetRangeType: profile?.budgetRangeType ?? "",
    budgetRangeStart:
      profile?.budgetRangeStart != null ? String(profile.budgetRangeStart) : "",
    budgetRangeEnd: profile?.budgetRangeEnd != null ? String(profile.budgetRangeEnd) : "",
    mdPreferredOccupation: profile?.mdPreferredOccupation ?? "",
    mdPreferredSpecialty: profile?.mdPreferredSpecialty ?? "",
    mdHowSoonLooking: profile?.mdHowSoonLooking ?? "",
    mdLookingDate: profile?.mdLookingDate ? profile.mdLookingDate.slice(0, 10) : "",
    // 0 is the column default, not a real budget
    mdMonthlyBudget: profile?.mdMonthlyBudget ? String(profile.mdMonthlyBudget) : "",
    mdIdealDescription: profile?.mdIdealDescription ?? "",
    introduction: profile?.introduction ?? "",
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
    budgetRangeStart,
    budgetRangeEnd,
    mdPreferredOccupation,
    mdPreferredSpecialty,
    introduction,
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
  // Present-but-empty clears the stored MD preference (undefined leaves it untouched).
  if (mdPreferredOccupation !== undefined) {
    fd.append("mdPreferredOccupation", mdPreferredOccupation);
  }
  if (mdPreferredSpecialty !== undefined) {
    fd.append("mdPreferredSpecialty", mdPreferredSpecialty);
  }
  // Present-but-empty clears the stored introduction (optional and erasable).
  if (introduction !== undefined) {
    fd.append("introduction", introduction);
  }

  stateOfLicensure?.forEach((s) => fd.append("stateOfLicensure[]", s));
  typeOfSupervisorNeeded?.forEach((t) => fd.append("typeOfSupervisorNeeded[]", t));

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
    licensureState: form.licensureState || undefined,
    stateOfLicensure: form.stateOfLicensure.length ? form.stateOfLicensure : undefined,
    typeOfSupervisorNeeded: (() => {
      const types = [
        ...new Set(
          [
            form.typeOfSupervisorNeeded,
            form.needsMedicalDirector ? MEDICAL_DIRECTOR_TYPE_NAME : "",
          ].filter(Boolean),
        ),
      ];
      return types.length > 0 ? types : undefined;
    })(),
    superviseeOccupation: form.superviseeOccupation.trim() || undefined,
    superviseeSpecialty: form.superviseeSpecialty.trim() || undefined,
    // Supervision-side preferences are sent only while a supervision type is
    // selected — for an MD-only profile the hidden fields stay untouched.
    howSoonLooking: form.typeOfSupervisorNeeded ? form.howSoonLooking || undefined : undefined,
    lookingDate:
      form.typeOfSupervisorNeeded && form.howSoonLooking === "CUSTOM_DATE"
        ? form.lookingDate || undefined
        : undefined,
    preferredFormat: form.preferredFormat || undefined,
    availability: form.availability || undefined,
    idealSupervisor: form.idealSupervisor.trim() || undefined,
    budgetRangeType: form.typeOfSupervisorNeeded ? form.budgetRangeType || undefined : undefined,
    // Monthly budgets are a single amount stored in budgetRangeEnd; start is 0
    budgetRangeStart: !form.typeOfSupervisorNeeded
      ? undefined
      : form.budgetRangeType === "MONTHLY"
        ? 0
        : form.budgetRangeStart !== ""
          ? parseInt(form.budgetRangeStart, 10)
          : undefined,
    budgetRangeEnd:
      form.typeOfSupervisorNeeded && form.budgetRangeEnd !== ""
        ? parseInt(form.budgetRangeEnd, 10)
        : undefined,
    // Medical Director preferences — the backend clears the md* columns itself
    // when the submitted needs no longer include Medical Director.
    mdPreferredOccupation: form.mdPreferredOccupation.trim(),
    mdPreferredSpecialty: form.mdPreferredSpecialty.trim(),
    mdHowSoonLooking: form.mdHowSoonLooking || undefined,
    mdLookingDate:
      form.mdHowSoonLooking === "CUSTOM_DATE" ? form.mdLookingDate || undefined : undefined,
    mdMonthlyBudget:
      form.mdMonthlyBudget !== "" ? parseInt(form.mdMonthlyBudget, 10) : undefined,
    mdIdealDescription: form.mdIdealDescription.trim() || undefined,
    // '' (not undefined) so an erased introduction clears the stored value
    introduction: form.introduction.trim(),
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
  HOURLY: "Hourly",
  MONTHLY: "Monthly",
};
