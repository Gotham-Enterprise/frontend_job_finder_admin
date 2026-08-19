export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SupervisorOccupation {
  id: number;
  name: string;
}

export interface SupervisorSpecialty {
  id: number;
  name: string;
}

/** Shape returned by GET /api/supervision/admin/supervisors list items */
export interface Supervisor {
  id: string;
  fullName: string;
  email: string;
  state: string | null;
  contactNumber: string | null;
  profilePhotoUrl: string | null;
  occupation: SupervisorOccupation | null;
  specialty: SupervisorSpecialty | null;
  /** Hierarchy-based plain strings from SupervisorProfile */
  supervisorType: string | null;
  supervisorOccupation: string | null;
  supervisorSpecialty: string | null;
  verificationStatus: VerificationStatus;
  licenseType: string | null;
  degreeType: string | null;
  /** Post-nominal letters displayed after the full name, e.g. "Ph.D., NCC, LPC-S (AL)" */
  professionalCredentials: string | null;
  yearsOfExperience: string | null;
  createdAt: string;
  /** Email confirmation status; used to gate the "Resend verification email" action. */
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  /** Whether the supervisor's profile is hidden from public listings; drives the Hide/Show action. */
  hideProfile: boolean;
}

/** Response shape from PATCH /api/supervision/admin/:id/hide-profile */
export interface HideProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    fullName: string;
    role: "SUPERVISOR" | "SUPERVISEE";
    hideProfile: boolean;
    profileVisibility: "HIDDEN" | "VISIBLE";
  };
}

export type SupervisorSortBy =
  | "fullName"
  | "state"
  | "yearsOfExperience"
  | "verificationStatus"
  | "hideProfile"
  | "createdAt";

export interface SupervisorFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  verificationStatus?: VerificationStatus | "";
  sortBy?: SupervisorSortBy;
  sortOrder?: "asc" | "desc";
}

export interface SupervisorsMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SupervisorsResponse {
  success: boolean;
  data: Supervisor[];
  metaData: SupervisorsMetaData;
  message?: string;
}

/**
 * One license row, each tied to its own state. Admin endpoints return full
 * entries including license numbers. `needsReview` marks legacy-migrated rows
 * whose state association still awaits the supervisor's confirmation.
 */
export interface SupervisorLicenseEntry {
  id?: string;
  licenseType: string | null;
  licenseNumber: string | null;
  state: string | null;
  licenseExpiration: string | null;
  needsReview?: boolean;
  sortOrder?: number;
}

/** Medical Director secondary offering (Supervising/Collaborating Physician) with its own credentials. */
export interface SupervisorOfferingEntry {
  id?: string;
  supervisorType: string;
  occupation?: string | null;
  specialty?: string | null;
  degreeType?: string | null;
  sortOrder?: number;
  licenses?: {
    id?: string;
    licenseNumber?: string | null;
    state?: string | null;
    licenseExpiration?: string | null;
    sortOrder?: number;
  }[];
}

/** Medical Director board certification (admin endpoints return full entries). */
export interface SupervisorBoardCertificationEntry {
  id?: string;
  certifyingBoard: string;
  specialty?: string | null;
  subspecialty?: string | null;
  certificationNumber?: string | null;
  expirationDate?: string | null;
  sortOrder?: number;
}

/** Supervisor profile from the detail endpoint */
export interface SupervisorProfile {
  id: string;
  userId: string;
  /** @deprecated Legacy mirror of the primary license — prefer `licenses`. */
  licenseType: string | null;
  degreeType: string | null;
  profession: string | null;
  professionOther: string | null;
  /** @deprecated Legacy mirror of the primary license — prefer `licenses`. */
  licenseNumber: string | null;
  /** @deprecated Legacy mirror of the primary license — prefer `licenses`. */
  stateLicense: string | null;
  /** @deprecated Legacy mirror of the primary license — prefer `licenses`. */
  licenseExpiration: string | null;
  /** All licenses, ordered by sortOrder (first = primary). Empty for unmigrated legacy records. */
  licenses?: SupervisorLicenseEntry[];
  /** Medical Director only: secondary service offerings. */
  offerings?: SupervisorOfferingEntry[];
  /** Medical Director only: board certifications. */
  boardCertifications?: SupervisorBoardCertificationEntry[];
  yearsOfExperience: string | null;
  npiNumber: string | null;
  certification: string[];
  patientPopulation: string[];
  supervisionFormat: string | null;
  availability: string | null;
  acceptingSupervisees: boolean;
  describeYourself: string | null;
  licenseUrl: string | null;
  licenseFileName: string | null;
  verificationDocumentUrl: string | null;
  supervisionFeeType: string | null;
  supervisionFeeAmount: number | null;
  professionalSummary: string | null;
  /** Post-nominal letters displayed after the full name, e.g. "Ph.D., NCC, LPC-S (AL)" */
  professionalCredentials: string | null;
  website: string | null;
  /** Hierarchy-based plain strings */
  supervisorType: string | null;
  occupation: string | null;
  specialty: string | null;
  verificationStatus: VerificationStatus;
  verificationNotes: string | null;
  verificationNotesAt: string | null;
  verifiedAt: string | null;
  verifiedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorSubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  billingCycle: string;
  isActive: boolean;
}

export interface SupervisorSubscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  plan: SupervisorSubscriptionPlan;
}

export interface SupervisorVerifiedByAdmin {
  id: string;
  email: string;
  fullName: string | null;
}

/** Full detail shape from GET /api/supervision/admin/supervisors/:id */
export interface SupervisorDetails {
  id: string;
  email: string;
  userName: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  contactNumber: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  profilePhotoUrl: string | null;
  stateOfLicensure: string[];
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** Legacy FK-based objects from SupervisionUser (may be null for new registrations) */
  occupation: SupervisorOccupation | null;
  specialty: SupervisorSpecialty | null;
  /** Hierarchy-based plain strings lifted from SupervisorProfile */
  supervisorOccupation: string | null;
  supervisorSpecialty: string | null;
  supervisorProfile: SupervisorProfile | null;
  /** supervisorSettings and permissions are excluded until the DB migration is applied */
  subscriptions: SupervisorSubscription[];
  verifiedByAdmin: SupervisorVerifiedByAdmin | null;
}

export interface SupervisorDetailsResponse {
  success: boolean;
  data: SupervisorDetails;
  message?: string;
}

export interface SupervisorActionResponse {
  success: boolean;
  message: string;
  data: SupervisorProfile;
}

export interface SupervisorResendVerificationResponse {
  success: boolean;
  message: string;
}

export interface SupervisorApproveEmailVerificationResponse {
  success: boolean;
  message: string;
}

/** One license per entry; `licenseType` is omitted for physicians (degreeType is shared). */
export interface SupervisorLicenseEntryPayload {
  licenseType?: string;
  licenseNumber: string;
  state: string;
  licenseExpiration: string;
}

/** Medical Director secondary offering — same shape the register endpoint accepts. */
export interface SupervisorOfferingPayload {
  supervisorType: string;
  occupation: string;
  specialty?: string;
  degreeType: string;
  licenses: { licenseNumber: string; state: string; licenseExpiration: string }[];
}

export interface SupervisorBoardCertificationPayload {
  certifyingBoard: string;
  specialty: string;
  subspecialty?: string;
  certificationNumber?: string;
  expirationDate?: string;
}

export interface SupervisorUpdatePayload {
  fullName?: string;
  /** Post-nominal letters after the name; empty string clears the stored value. */
  professionalCredentials?: string;
  contactNumber?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  supervisorType?: string;
  occupation?: string | null;
  specialty?: string | null;
  degreeType?: string;
  /**
   * Full replace of the supervisor's licenses (each entry carries its state);
   * the backend re-derives stateOfLicensure from them. Omit to leave license
   * rows untouched.
   */
  licenses?: SupervisorLicenseEntryPayload[];
  /** Medical Director only — full replace; empty array clears all offerings. */
  offerings?: SupervisorOfferingPayload[];
  /** Medical Director only — full replace; empty array clears all certifications. */
  boardCertifications?: SupervisorBoardCertificationPayload[];
  yearsOfExperience?: string;
  patientPopulation?: string[];
  certification?: string[];
  supervisionFormat?: string;
  availability?: string;
  professionalSummary?: string;
  describeYourself?: string;
  acceptingSupervisees?: boolean;
  supervisionFeeType?: string;
  supervisionFeeAmount?: number;
  uploadProfilePhoto?: File;
  uploadLicense?: File;
}

export interface SupervisorUpdateResponse {
  success: boolean;
  message: string;
  data: {
    user: Pick<SupervisorDetails, "id" | "fullName" | "contactNumber" | "city" | "state" | "zipcode" | "profilePhotoUrl" | "stateOfLicensure">;
    supervisor: SupervisorProfile;
  };
}
