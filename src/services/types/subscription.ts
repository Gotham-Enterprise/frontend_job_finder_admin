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
