'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PricingPlan } from '@/services/types/subscription';
import { useSubscriptionContext, SubscriptionData } from '@/context/SubscriptionContext';
import { subscriptionApi } from '@/services/api/subscription';
import { useToast } from '@/context/ToastContext';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function CheckoutContent() {
  const [couponCode, setCouponCode] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const employerId = searchParams.get('employerId');
  const planId = searchParams.get('planId');
  const { addToast } = useToast();
  
  const { subscriptionData, setSubscriptionData, clearSubscriptionData, isSubscriptionDataReady } = useSubscriptionContext();

  useEffect(() => {
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

  const calculateDiscount = (originalPriceInCents: number, coupon: any) => {
    if (!coupon) return 0;
    
    if (coupon.amountOffInCents) {
      return coupon.amountOffInCents;
    }
    
    if (coupon.percentOff) {
      return Math.round((originalPriceInCents * coupon.percentOff) / 100);
    }
    
    return 0;
  };

  const calculateTotal = () => {
    if (!subscriptionData) return 0;
    
    const originalPrice = subscriptionData.planDetails.price;
    const discount = subscriptionData.appliedCoupon 
      ? calculateDiscount(originalPrice, subscriptionData.appliedCoupon)
      : 0;
    
    return Math.max(0, originalPrice - discount);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast({
        variant: 'warning',
        title: 'Coupon Required',
        message: 'Please enter a coupon code',
      });
      return;
    }

    if (subscriptionData?.appliedCoupon) {
      addToast({
        variant: 'warning',
        title: 'Coupon Already Applied',
        message: 'Only one coupon can be applied per order. Please remove the current coupon first.',
      });
      return;
    }

    setIsVerifyingCoupon(true);
    setCouponError(null);
    
    try {
      const response = await subscriptionApi.verifyCoupon(couponCode);
      
      if (response.success && response.data) {
        const discount = calculateDiscount(subscriptionData?.planDetails.price || 0, response.data);
        
        addToast({
          variant: 'success',
          title: 'Coupon Applied',
          message: `Coupon "${response.data.title}" has been applied successfully! You saved ${formatPrice(discount)}.`,
        });
        
        // Update subscription data with coupon
        if (subscriptionData) {
          setSubscriptionData({
            ...subscriptionData,
            couponRedemptionCode: response.data.redemptionCode,
            appliedCoupon: response.data,
          });
        }
        
        setCouponCode('');
      } else {
        const errorMessage = response.error || 'The coupon code is invalid or expired';
        setCouponError(errorMessage);
        addToast({
          variant: 'error',
          title: 'Invalid Coupon',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error verifying coupon:', error);
      const errorMessage = 'Failed to verify coupon. Please try again.';
      setCouponError(errorMessage);
      addToast({
        variant: 'error',
        title: 'Verification Failed',
        message: errorMessage,
      });
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponError(null);
    
    if (subscriptionData) {
      setSubscriptionData({
        ...subscriptionData,
        couponRedemptionCode: undefined,
        appliedCoupon: undefined,
      });
    }

    addToast({
      variant: 'info',
      title: 'Coupon Removed',
      message: 'The coupon has been removed from your order',
    });
  };

  const confirmAndPay = () => {
    if (!subscriptionData) return;
    
    // Check if there's a coupon error that would prevent payment
    if (couponError) {
      addToast({
        variant: 'error',
        title: 'Cannot Proceed',
        message: 'Please resolve the coupon issue before proceeding to payment.',
      });
      return;
    }
    
    // Navigate to payment form page
    router.push(`/pricing/checkout/payment?employerId=${employerId}&planId=${planId}`);
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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order summary
            </h3>
            <button
              onClick={changePlan}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Edit order
            </button>
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

            {/* Applied Coupon */}
            {subscriptionData?.appliedCoupon && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Coupon: {subscriptionData.appliedCoupon.title}
                    </span>
                    <span className="text-sm text-green-500 dark:text-green-400">
                      Code: {subscriptionData.appliedCoupon.redemptionCode}
                    </span>
                  </div>
                  <span className="font-semibold">
                    -{formatPrice(calculateDiscount(subscriptionData.planDetails.price, subscriptionData.appliedCoupon))}
                  </span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(calculateTotal())}
              </span>
            </div>

            {/* Coupon Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              {subscriptionData?.appliedCoupon ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-green-700 dark:text-green-300 font-medium">
                          {subscriptionData.appliedCoupon.title}
                        </div>
                        <div className="text-green-600 dark:text-green-400 text-sm">
                          {subscriptionData.appliedCoupon.description}
                        </div>
                        <div className="text-green-600 dark:text-green-400 text-xs">
                          Code: {subscriptionData.appliedCoupon.redemptionCode}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Only one coupon can be applied per order. Remove the current coupon to add a different one.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError(null); // Clear error when typing
                      }}
                      disabled={isVerifyingCoupon}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={isVerifyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center min-w-[60px] justify-center"
                    >
                      {isVerifyingCoupon ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      {couponError}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    You can apply one coupon per order
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3">
              {/* Confirm and Pay Button */}
              <button
                onClick={confirmAndPay}
                disabled={!!couponError || isVerifyingCoupon}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isVerifyingCoupon ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying coupon...
                  </>
                ) : (
                  'Confirm and pay'
                )}
              </button>
              {couponError && (
                <div className="text-red-600 dark:text-red-400 text-sm text-center">
                  Please resolve the coupon issue to proceed
                </div>
              )}

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
            What&aposs included in {subscriptionData.planDetails.name}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  );
}
