import { PlanInterval } from './subscription';

export interface AdminSubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  stripeProductId: string;
  stripePriceId: string;
  priceInCents: number;
  interval: PlanInterval;
  isActive: boolean;
  isTrialPlan: boolean;
  isCustom: boolean;
  jobPostCredit: number;
  resumeSearchCredit: number | null;
  profileViewsCredit: number;
  emailSendingCredit: number;
  resumeDownloadCredit: number;
  employeesSeatsCredit: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPlanListMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminPlanListResponse {
  success: boolean;
  data: AdminSubscriptionPlan[];
  metaData: AdminPlanListMeta;
}

export interface AdminPlanMutationResponse {
  success: boolean;
  message: string;
  data: AdminSubscriptionPlan;
}

export type PlanKind = 'standard' | 'custom';

export interface AdminPlanFilters {
  kind: PlanKind;
  page?: number;
  limit?: number;
  keyword?: string;
  interval?: PlanInterval | '';
  sortBy?: 'name' | 'priceInCents' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomPlanPayload {
  name: string;
  description?: string | null;
  priceInCents: number;
  interval: PlanInterval;
  jobPostCredit: number;
  resumeSearchCredit: number | null;
  profileViewsCredit: number;
  emailSendingCredit: number;
  resumeDownloadCredit: number;
  employeesSeatsCredit: number;
  isActive?: boolean;
}
