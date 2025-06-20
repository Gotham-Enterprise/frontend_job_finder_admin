import { useState, useEffect } from 'react';
import { subscriptionApi } from '@/services/api/subscription';
import { SubscriptionDetails } from '@/services/types/subscription';

export const useSubscription = (employerId: string | null) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!employerId) {
        setError('Employer ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await subscriptionApi.getSubscriptionDetails(employerId);
        if (response.success) {
          setSubscriptionData(response.data);
        } else {
          setError('Failed to fetch subscription data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSubscriptionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [employerId]);
  const refetch = async () => {
    if (!employerId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionApi.getSubscriptionDetails(employerId);
      if (response.success) {
        setSubscriptionData(response.data);
      } else {
        setError('Failed to fetch subscription data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubscriptionData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptionData,
    loading,
    error,
    refetch
  };
};
