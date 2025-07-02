'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePricingPlans } from '@/services/hooks/usePricingPlans';
import { PricingPlan, PlanInterval } from '@/services/types/subscription';
import { useSubscriptionContext } from '@/context/SubscriptionContext';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

const PLAN_INTERVALS: { value: PlanInterval; label: string; discount?: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly', discount: 'Save 5%' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-Annually', discount: 'Save 10%' },
  { value: 'ANNUALLY', label: 'Annually', discount: 'Save 15%' },
];

export default function PricingTable() {
  const [selectedInterval, setSelectedInterval] = useState<PlanInterval>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const { plans, isLoading, error, refetchPlans } = usePricingPlans(selectedInterval);
  const { setSubscriptionData } = useSubscriptionContext();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const employerId = searchParams.get('employerId');

  const onIntervalChange = (interval: PlanInterval) => {
    setSelectedInterval(interval);
  };

  const getOrderedPlans = (plans: PricingPlan[]) => {
    const planOrder = [
      'SMALL BUSINESS',
      'PROFESSIONAL PLAN', 
      'MEDIUM BUSINESS PLAN',
      'ENTERPRISE PLAN'
    ];
    
    return [...plans].sort((a, b) => {
      const aIndex = planOrder.findIndex(order => 
        a.name.toUpperCase().includes(order.toUpperCase()) || 
        order.toUpperCase().includes(a.name.toUpperCase())
      );
      const bIndex = planOrder.findIndex(order => 
        b.name.toUpperCase().includes(order.toUpperCase()) || 
        order.toUpperCase().includes(b.name.toUpperCase())
      );
     
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const navigateBack = () => {
    router.back();
  };

  const selectPlan = (plan: PricingPlan) => {
  
    setSelectedPlan(plan);
    
    const subscriptionData = {
      subscriptionPlanId: plan.id,
      stripePriceId: plan.stripePriceId,
      companyId: employerId || "", 
      paymentMethodType: "card",
      paymentMethodToken: "", // Will be filled in payment step
      isSetCardDefault: true,
      planDetails: {
        name: plan.name,
        price: plan.monthlyCostInCents,
        upfrontCost: plan.upfrontCostInCents,
        interval: selectedInterval,
        planInclusions: plan.planInclusions
      }
    };
    
    // Store in context instead of localStorage
    setSubscriptionData(subscriptionData);
    
    console.log('Selected plan:', plan);
    console.log('Subscription data prepared:', subscriptionData);
    
    // Navigate to the order summary/checkout page
    router.push(`/pricing/checkout?employerId=${employerId}&planId=${plan.id}`);
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading pricing plans..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => refetchPlans(selectedInterval)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={navigateBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select the plan that best fits your hiring needs
          </p>
        </div>

        {/* Billing Interval Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-1">
              {PLAN_INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => onIntervalChange(interval.value)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedInterval === interval.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div>{interval.label}</div>
                  {interval.discount && (
                    <div className={`text-xs ${
                      selectedInterval === interval.value ? 'text-blue-100' : 'text-green-600'
                    }`}>
                      {interval.discount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getOrderedPlans(plans).map((plan, index) => (
            <div
              key={plan.id}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                {/* Plan Name */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name.replace(' Plan', '')}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.monthlyCostInCents)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      /{selectedInterval.toLowerCase()}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => selectPlan(plan)}
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  >
                    Buy plan
                  </button>
                </div>

                {/* Features Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Features
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Job Posts</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.planInclusions.jobPost}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Email Sending</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.planInclusions.emailSending.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Profile Views</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.planInclusions.candidateProfileViews.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Resume Downloads</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.planInclusions.resumeDownload.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Resume Search</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.planInclusions.resumeSearch}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
