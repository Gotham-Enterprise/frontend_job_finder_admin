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
  yearsOfExperience: string | null;
  createdAt: string;
}

export interface SupervisorFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  verificationStatus?: VerificationStatus | "";
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

/** Supervisor profile from the detail endpoint */
export interface SupervisorProfile {
  id: string;
  userId: string;
  licenseType: string | null;
  degreeType: string | null;
  profession: string | null;
  professionOther: string | null;
  licenseNumber: string | null;
  stateLicense: string | null;
  licenseExpiration: string | null;
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

export interface SupervisorUpdatePayload {
  fullName?: string;
  contactNumber?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  supervisorType?: string;
  occupation?: string | null;
  specialty?: string | null;
  licenseType?: string;
  degreeType?: string;
  licenseNumber?: string;
  licenseExpiration?: string;
  yearsOfExperience?: string;
  stateOfLicensure?: string[];
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
