export interface SubscriptionDetails {
  id: string;
  companyName: string;
  email: string;
  nextPaymentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  card: string;
  last4Digits: string;
  brand: string;
  currentPlan: string;
  currentPlanId: number;
}

export interface SubscriptionDetailsResponse {
  success: boolean;
  data: SubscriptionDetails;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: PlanFeature[];
}

export type PlanInterval = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';

export interface PlanInclusions {
  jobPost: number;
  emailSending: number;
  candidateProfileViews: number;
  resumeDownload: number;
  resumeSearch: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  description: string;
  monthlyCostInCents: number;
  upfrontCostInCents: number;
  stripePriceId: string;
  planInclusions: PlanInclusions;
}

export interface PricingPlansData {
  interval: PlanInterval;
  plansAndPricing: PricingPlan[];
}

export interface PricingPlansResponse {
  success: boolean;
  data: PricingPlansData;
}
