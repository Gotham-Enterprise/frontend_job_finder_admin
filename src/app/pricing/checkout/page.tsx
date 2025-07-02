'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PricingPlan } from '@/services/types/subscription';
import { useSubscriptionContext, SubscriptionData } from '@/context/SubscriptionContext';

export default function CheckoutPage() {
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const employerId = searchParams.get('employerId');
  const planId = searchParams.get('planId');
  
  const { subscriptionData, clearSubscriptionData, isSubscriptionDataReady } = useSubscriptionContext();

  useEffect(() => {
    // If no subscription data is available, redirect back to pricing
    if (!isSubscriptionDataReady) {
      router.push(`/pricing?employerId=${employerId}`);
    }
  }, [isSubscriptionDataReady, employerId, router]);

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const applyCoupon = () => {
    // Implement coupon logic here
    console.log('Applying coupon:', couponCode);
  };

  const confirmAndPay = async () => {
    if (!subscriptionData) return;
    
    setIsProcessing(true);
    try {
      // Here you would integrate with your payment processing
      // For now, we'll just simulate the process
      
      const finalPayload = {
        subscriptionPlanId: subscriptionData.subscriptionPlanId,
        stripePriceId: subscriptionData.stripePriceId,
        companyId: subscriptionData.companyId,
        paymentMethodType: subscriptionData.paymentMethodType,
        paymentMethodToken: "tok_visa", // This would come from Stripe integration
        isSetCardDefault: subscriptionData.isSetCardDefault
      };
      
      console.log('Final payment payload:', finalPayload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear subscription data after successful payment
      clearSubscriptionData();
      
      // Navigate to success page or back to dashboard
      router.push(`/admin/subscriptions?employerId=${employerId}&success=true`);
      
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const changePlan = () => {
    router.push(`/pricing?employerId=${employerId}`);
  };

  const navigateBack = () => {
    router.back();
  };

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={navigateBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Plans
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Subscriptions
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {subscriptionData.planDetails.name}
          </h2>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Order Summary Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order summary
            </h3>
          </div>

          {/* Order Details */}
          <div className="px-6 py-4 space-y-4">
            {/* Plan Item */}
            <div className="flex justify-between items-center">
              <span className="text-gray-900 dark:text-white font-medium">
                {subscriptionData.planDetails.name}
              </span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {formatPrice(subscriptionData.planDetails.price)}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(subscriptionData.planDetails.price)}
              </span>
            </div>

            {/* Coupon Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3">
              {/* Confirm and Pay Button */}
              <button
                onClick={confirmAndPay}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm and pay'
                )}
              </button>

              {/* Change Plan Button */}
              <button
                onClick={changePlan}
                className="w-full py-3 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Change plan
              </button>
            </div>
          </div>
        </div>

        {/* Plan Features Summary */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What's included in {subscriptionData.planDetails.name}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {subscriptionData.planDetails.planInclusions.jobPost} Job Posts
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {subscriptionData.planDetails.planInclusions.emailSending.toLocaleString()} Email Sends
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {subscriptionData.planDetails.planInclusions.candidateProfileViews.toLocaleString()} Profile Views
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {subscriptionData.planDetails.planInclusions.resumeDownload.toLocaleString()} Resume Downloads
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {subscriptionData.planDetails.planInclusions.resumeSearch} Resume Search
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
