import { useState, useEffect } from 'react';
import { subscriptionApi } from '../api/subscription';
import { SubscriptionDetails } from '../types/subscription';

export const useSubscriptionByCompany = (companyId: string | null) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await subscriptionApi.getSubscriptionByCompanyId(companyId);
        
        if (response.success) {
          setSubscriptionData(response.data);
        } else {
          setError('Failed to fetch subscription data');
        }
      } catch (err) {
        setError('An error occurred while fetching subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [companyId]);

  return { subscriptionData, loading, error };
};
