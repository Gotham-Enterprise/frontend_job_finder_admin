'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PricingPlan, PlanInterval } from '@/services/types/subscription';

export interface SubscriptionData {
  subscriptionPlanId: number;
  stripePriceId: string;
  companyId: string;
  paymentMethodType: string;
  paymentMethodToken: string;
  isSetCardDefault: boolean;
  planDetails: {
    name: string;
    price: number;
    upfrontCost: number;
    interval: PlanInterval;
    planInclusions: any;
  };
}

interface SubscriptionContextType {
  subscriptionData: SubscriptionData | null;
  setSubscriptionData: (data: SubscriptionData | null) => void;
  clearSubscriptionData: () => void;
  isSubscriptionDataReady: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscriptionData, setSubscriptionDataState] = useState<SubscriptionData | null>(null);

  const setSubscriptionData = (data: SubscriptionData | null) => {
    setSubscriptionDataState(data);
  };

  const clearSubscriptionData = () => {
    setSubscriptionDataState(null);
  };

  const isSubscriptionDataReady = subscriptionData !== null;

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionData,
        setSubscriptionData,
        clearSubscriptionData,
        isSubscriptionDataReady,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}
