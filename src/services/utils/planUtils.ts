// Plan configuration and utilities
export interface PlanConfig {
  id: number;
  name: string;
  price: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<number, PlanConfig> = {
  1: {
    id: 1,
    name: 'Small Business Plan',
    price: '$399.00',
    features: [
      'Up to 3 Company employees',
      '5 Job posting',
      '100/month Emails',
      '100/month Profile views',
      '100/month Resume file downloads',
      'Unlimited Resume database searches'
    ]
  },
  2: {
    id: 2,
    name: 'Medium Business Plan',
    price: '$599.00',
    features: [
      'Up to 10 Company employees',
      '15 Job posting',
      '300/month Emails',
      '300/month Profile views',
      '300/month Resume file downloads',
      'Unlimited Resume database searches',
      'Priority support'
    ]
  },
  3: {
    id: 3,
    name: 'Enterprise Plan',
    price: '$999.00',
    features: [
      'Unlimited Company employees',
      'Unlimited Job posting',
      'Unlimited Emails',
      'Unlimited Profile views',
      'Unlimited Resume file downloads',
      'Unlimited Resume database searches',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
};

export const getPlanConfig = (planId: number): PlanConfig => {
  return PLAN_CONFIGS[planId] || PLAN_CONFIGS[1];
};

export const getPlanPrice = (planId: number): string => {
  return getPlanConfig(planId).price;
};

export const getPlanFeatures = (planId: number): string[] => {
  return getPlanConfig(planId).features;
};

export const formatInterval = (interval: string): string => {
  switch (interval.toLowerCase()) {
    case 'monthly':
      return 'month';
    case 'yearly':
      return 'year';
    case 'weekly':
      return 'week';
    case 'daily':
      return 'day';
    default:
      return interval.toLowerCase();
  }
};
