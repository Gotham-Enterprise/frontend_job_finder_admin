export interface SubscriptionDetails {
  id: string;
  stripeSubscriptionId: string;
  companyId: string;
  currentPlanId: number;
  couponId: string | null;
  currentPaymentMethodId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  currentSubscriptionStartDate: string;
  currentSubscriptionEndDate: string;
  nextPaymentDate: string | null;
  schedulledDowngradeDate: string | null;
  schedulledDowngradePlanId: number | null;
  jobPostsUsed: number;
  resumeSearchUsed: number;
  profileViewsUsed: number;
  emailSendingUsed: number;
  resumeDownloadUsed: number;
  employeesSeatsUsed: number;
  isFeaturedEmployer: boolean;
  createdAt: string;
  updatedAt: string;
  currentPlan: {
    id: number;
    name: string;
    description: string;
    stripeProductId: string;
    stripePriceId: string;
    priceInCents: number;
    interval: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
    isActive: boolean;
    isTrialPlan: boolean;
    jobPostCredit: number;
    resumeSearchCredit: number | null;
    profileViewsCredit: number;
    emailSendingCredit: number;
    resumeDownloadCredit: number;
    employeesSeatsCredit: number;
    createdAt: string;
    updatedAt: string;
  };
  company: {
    id: string;
    name: string;
  };
  coupon: any | null;
  currentPaymentMethod: any | null;
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

export interface SubscriptionPurchaseRequest {
  subscriptionPlanId: number;
  stripePriceId: string;
  companyId: string;
  couponRedemptionCode?: string; // Optional
  paymentMethodType: string;
  paymentMethodToken: string;
  isSetCardDefault: boolean;
}

export interface SubscriptionPurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    subscriptionId: string;
    status: string;
  };
}

export interface CouponVerificationResponse {
  success: boolean;
  message?: string;
  data?: {
    couponCode: string;
    discountAmount: number;
    isValid: boolean;
  };
  error?: string;
}
