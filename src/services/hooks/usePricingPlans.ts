import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi } from '@/services/api/subscription';
import { PricingPlan, PlanInterval, PricingPlansResponse } from '@/services/types/subscription';

interface UsePricingPlansResult {
  plans: PricingPlan[];
  isLoading: boolean;
  error: string | null;
  refetchPlans: (interval?: PlanInterval) => Promise<void>;
}

export function usePricingPlans(initialInterval: PlanInterval = 'MONTHLY'): UsePricingPlansResult {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricingPlans = useCallback(async (interval: PlanInterval = 'MONTHLY') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: PricingPlansResponse = await subscriptionApi.getSubscriptionPlans(interval);
      
      if (response.success) {
        setPlans(response.data.plansAndPricing);
      } else {
        setError('Failed to fetch pricing plans');
      }
    } catch (err) {
      setError('An error occurred while fetching pricing plans');
      console.error('Error fetching pricing plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricingPlans(initialInterval);
  }, [initialInterval, fetchPricingPlans]);

  return {
    plans,
    isLoading,
    error,
    refetchPlans: fetchPricingPlans,
  };
}
