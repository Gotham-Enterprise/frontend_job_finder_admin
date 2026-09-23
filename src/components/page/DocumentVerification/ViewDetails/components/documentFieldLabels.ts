import { formatDate } from "@/services/utils/dateUtils";
import { DocumentVerificationFields } from "@/services/types/documentVerification";

// Covers every field key document_verification_service.js#getDocumentVerification can return
// across both kinds (wallet credentials and education) — see WRITABLE_FIELDS /
// CONTENT_FIELDS on the backend for the source of truth this mirrors.
const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  subtitle: "Subtitle",
  identifierNumber: "Identifier / License Number",
  secondaryIdentifier: "State / Secondary ID",
  primaryDate: "Date",
  secondaryDate: "Expiration Date",
  description: "Description",
  medicaidProviderNumber: "Medicaid Provider Number",
  degree: "Degree",
  fieldOfStudy: "Field of Study",
  institution: "Institution",
  startDate: "Start Date",
  endDate: "End Date",
};

const DATE_FIELDS = new Set(["primaryDate", "secondaryDate", "startDate", "endDate"]);

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export function formatFieldValue(key: string, value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return DATE_FIELDS.has(key) ? formatDate(value, value) : value;
}

/** Ordered [key, value] pairs for display — skips empty/undefined fields entirely. */
export function displayableFieldEntries(fields: DocumentVerificationFields): [string, string][] {
  return Object.entries(fields)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => [key, value as string]);
}
