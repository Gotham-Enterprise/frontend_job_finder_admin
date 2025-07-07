'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PricingPlan, PlanInterval, CouponData } from '@/services/types/subscription';

export interface SubscriptionData {
  subscriptionPlanId: number;
  stripePriceId: string;
  companyId: string;
  couponRedemptionCode?: string;
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
  appliedCoupon?: CouponData;
}

interface SubscriptionContextType {
  subscriptionData: SubscriptionData | null;
  setSubscriptionData: (data: SubscriptionData | null) => void;
  clearSubscriptionData: () => void;
  isSubscriptionDataReady: boolean;
  copyToClipboard: (text: string, label: string) => Promise<void>;
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

  const copyToClipboard = async (text: string, label: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {

      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const isSubscriptionDataReady = subscriptionData !== null;

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionData,
        setSubscriptionData,
        clearSubscriptionData,
        isSubscriptionDataReady,
        copyToClipboard,
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
