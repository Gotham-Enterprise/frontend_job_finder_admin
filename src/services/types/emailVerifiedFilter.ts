/** Query value for the admin list "Email Verified" filter; omitted means all users. */
export type EmailVerifiedFilter = "true" | "false";

export const EMAIL_VERIFIED_FILTER_OPTIONS: Array<{ value: EmailVerifiedFilter; label: string }> = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

/** Narrows a URL/localStorage value to a valid filter, dropping anything else. */
export const parseEmailVerifiedFilter = (value: unknown): EmailVerifiedFilter | undefined =>
  value === "true" || value === "false" ? value : undefined;
