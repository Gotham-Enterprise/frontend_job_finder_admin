export interface SuperviseeOccupation {
  id: number;
  name: string;
}

export interface SuperviseeSpecialty {
  id: number;
  name: string;
}

/** Shape returned by GET /api/supervision/admin/supervisees list items */
export interface Supervisee {
  id: string;
  fullName: string;
  email: string;
  state: string | null;
  contactNumber: string | null;
  profilePhotoUrl: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  status: string;
  occupation: SuperviseeOccupation | null;
  specialty: SuperviseeSpecialty | null;
  preferredFormat: string | null;
  howSoonLooking: string | null;
  stateTheyAreLookingIn: string[];
  budgetRangeType: string | null;
  budgetRangeStart: number | null;
  budgetRangeEnd: number | null;
  superviseeOccupation: string | null;
  superviseeSpecialty: string | null;
  createdAt: string;
}

export interface SuperviseeFilters {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface SuperviseeResendVerificationResponse {
  success: boolean;
  message: string;
}

export interface SuperviseesMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuperviseesResponse {
  success: boolean;
  data: Supervisee[];
  metaData: SuperviseesMetaData;
  message?: string;
}

export interface SuperviseeProfile {
  id: string;
  userId: string;
  typeOfSupervisorNeeded: string[];
  howSoonLooking: string | null;
  lookingDate: string | null;
  preferredFormat: string | null;
  title: string | null;
  superviseeOccupation: string | null;
  superviseeSpecialty: string | null;
  availability: string | null;
  idealSupervisor: string | null;
  stateTheyAreLookingIn: string[];
  budgetRangeType: string | null;
  budgetRangeStart: number | null;
  budgetRangeEnd: number | null;
  completedCount: number;
  leftCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuperviseeSubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  billingCycle: string;
  isActive: boolean;
}

export interface SuperviseeSubscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  plan: SuperviseeSubscriptionPlan;
}

/** Full detail shape from GET /api/supervision/admin/supervisees/:id */
export interface SuperviseeDetails {
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
  occupation: SuperviseeOccupation | null;
  specialty: SuperviseeSpecialty | null;
  occupationId?: number | null;
  specialtyId?: number | null;
  superviseeProfile: SuperviseeProfile | null;
  subscriptions: SuperviseeSubscription[];
}

export interface SuperviseeDetailsResponse {
  success: boolean;
  data: SuperviseeDetails;
  message?: string;
}

export interface SuperviseeUpdatePayload {
  fullName?: string;
  contactNumber?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  occupation?: string;
  specialty?: string;
  title?: string;
  stateOfLicensure?: string[];
  typeOfSupervisorNeeded?: string[];
  superviseeOccupation?: string;
  superviseeSpecialty?: string;
  howSoonLooking?: string;
  lookingDate?: string;
  preferredFormat?: string;
  availability?: string;
  idealSupervisor?: string;
  stateTheyAreLookingIn?: string[];
  budgetRangeType?: string;
  budgetRangeStart?: number;
  budgetRangeEnd?: number;
  uploadProfilePhoto?: File;
}

export interface SuperviseeUpdateResponse {
  success: boolean;
  message: string;
  data: {
    user: SuperviseeDetails;
    supervisee: SuperviseeProfile;
  };
}
