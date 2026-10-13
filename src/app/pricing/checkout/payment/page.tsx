'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useSubscriptionContext } from '@/context/SubscriptionContext';
import { subscriptionApi } from '@/services/api/subscription';
import { useToast } from '@/context/ToastContext';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useConfirmation } from '@/hooks/useConfirmation';
import { formatCouponDurationCheckout } from '@/services/utils/couponDuration';

// Helper: returns true when the applied coupon brings the order total to $0
function isCouponFullyCovered(originalPriceInCents: number, coupon: any): boolean {
  if (!coupon) return false;
  if (coupon.percentOff === 100) return true;
  if (coupon.amountOffInCents && coupon.amountOffInCents >= originalPriceInCents) return true;
  return false;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function PaymentForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmation = useConfirmation();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employerId = searchParams.get('employerId');
  const planId = searchParams.get('planId');
  const { addToast } = useToast();

  const { subscriptionData, clearSubscriptionData, isSubscriptionDataReady } = useSubscriptionContext();

  // Derived: is this a 100%-off free order?
  const isFreeOrder =
    !!subscriptionData?.appliedCoupon &&
    isCouponFullyCovered(subscriptionData.planDetails.price, subscriptionData.appliedCoupon);

  // Should we warn the employer that they'll need a payment method at renewal?
  const showRenewalWarning =
    isFreeOrder &&
    subscriptionData?.appliedCoupon?.duration !== 'forever';

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

  const handleEditOrder = () => {
    router.push(`/pricing?employerId=${employerId}`);
  };

  // Called when the order is 100% off — no card token needed
  const handleFreeActivation = async () => {
    if (!subscriptionData) return;

    setIsProcessing(true);
    setError(null);

    try {
      const freePayload = {
        subscriptionPlanId: subscriptionData.subscriptionPlanId,
        stripePriceId: subscriptionData.stripePriceId,
        companyId: subscriptionData.companyId,
        ...(subscriptionData.couponRedemptionCode && {
          couponRedemptionCode: subscriptionData.couponRedemptionCode,
        }),
      };

      const response = await subscriptionApi.purchaseSubscription(freePayload);

      if (!response.success) {
        throw new Error(response.message || 'Activation failed');
      }

      addToast({
        variant: 'success',
        title: 'Subscription Activated!',
        message: 'The subscription has been activated for free.',
        duration: 6000,
      });

      clearSubscriptionData();
      router.push(`/admin/subscriptions?employerId=${employerId}&success=true`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Activation failed. Please try again.';
      setError(errorMessage);
      addToast({
        variant: 'error',
        title: 'Activation Failed',
        message: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !subscriptionData) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardNumberElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {

      const { token, error: stripeError } = await stripe.createToken(cardElement);

      if (stripeError) {
        setError(stripeError.message || 'An error occurred while processing your card');
        setIsProcessing(false);
        return;
      }

      if (!token) {
        setError('Failed to create payment token');
        setIsProcessing(false);
        return;
      }

      const finalPayload = {
        subscriptionPlanId: subscriptionData.subscriptionPlanId,
        stripePriceId: subscriptionData.stripePriceId,
        companyId: subscriptionData.companyId,
        ...(subscriptionData.couponRedemptionCode && { couponRedemptionCode: subscriptionData.couponRedemptionCode }),
        paymentMethodType: subscriptionData.paymentMethodType,
        paymentMethodToken: token.id,
        isSetCardDefault: subscriptionData.isSetCardDefault
      };

      console.log('Final payment payload:', finalPayload);

      const response = await subscriptionApi.purchaseSubscription(finalPayload);

      if (!response.success) {
        throw new Error(response.message || 'Purchase failed');
      }

      addToast({
        variant: 'success',
        title: 'Payment Successful!',
        message: 'Your subscription has been activated successfully.',
        duration: 6000,
      });


      clearSubscriptionData();

      router.push(`/admin/subscriptions?employerId=${employerId}&success=true`);

    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setError(errorMessage);

      addToast({
        variant: 'error',
        title: 'Payment Failed',
        message: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  const handleSendQuote = async () => {
    if (!subscriptionData) return;

    const companyId = employerId || subscriptionData.companyId;
    if (!companyId) {
      addToast({
        variant: 'error',
        title: 'Quote not sent',
        message: 'Company is missing from this checkout.',
        duration: 5000,
      });
      return;
    }

    const couponNote = subscriptionData.appliedCoupon
      ? ` Coupon ${subscriptionData.appliedCoupon.redemptionCode} will be applied automatically.`
      : '';

    const confirmed = await confirmation.confirm({
      title: 'Send quote',
      message: `Email active users at this company a link to complete the ${subscriptionData.planDetails.name} upgrade.${couponNote}`,
      confirmText: 'Send quote',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setIsSendingQuote(true);
    try {
      const response = await subscriptionApi.sendSubscriptionQuote({
        companyId,
        subscriptionPlanId: subscriptionData.subscriptionPlanId,
        duration: subscriptionData.planDetails.interval,
        ...(subscriptionData.couponRedemptionCode
          ? { couponRedemptionCode: subscriptionData.couponRedemptionCode }
          : {}),
      });

      addToast({
        variant: 'success',
        title: 'Quote sent',
        message: response.message || 'The employer can now complete this upgrade.',
        duration: 6000,
      });
    } catch (sendError) {
      const errorMessage =
        sendError instanceof Error ? sendError.message : 'Failed to send the quote.';
      addToast({
        variant: 'error',
        title: 'Quote not sent',
        message: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSendingQuote(false);
    }
  };

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const appliedCouponDurationLabel = formatCouponDurationCheckout(
    subscriptionData.appliedCoupon?.duration,
    subscriptionData.appliedCoupon?.durationInMonths
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={navigateBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Order Summary
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your payment details to complete your subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {isFreeOrder ? 'Subscription Activation' : 'Payment Method'}
              </h2>

              {isFreeOrder ? (
                /* ── FREE ORDER PATH ────────────────────────────────────────── */
                <div className="space-y-4">
                  {/* "No payment required" banner */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        No payment required
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                        The applied coupon covers 100% of the subscription cost. No credit card is needed to activate.
                      </p>
                    </div>
                  </div>

                  {/* Renewal warning for once / repeating coupons */}
                  {showRenewalWarning && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-300">
                          Payment method required at renewal
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                          This coupon applies for a limited period. The employer will need to add a payment method before the next billing cycle to keep the subscription active.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Activate for Free button */}
                  <button
                    type="button"
                    onClick={handleFreeActivation}
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Activating...
                      </>
                    ) : (
                      'Activate for Free'
                    )}
                  </button>

                  {/* Send quote still available */}
                  <button
                    type="button"
                    onClick={handleSendQuote}
                    disabled={isSendingQuote || isProcessing}
                    className="w-full py-3 px-4 border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:disabled:text-gray-500 font-semibold rounded-lg transition-colors duration-200"
                  >
                    {isSendingQuote ? 'Sending quote...' : 'Send quote'}
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Email the employer a link to complete this upgrade.
                  </p>
                </div>
              ) : (
                /* ── PAID ORDER PATH (existing card form) ───────────────────── */
                <>
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payment method
                    </label>
                    <div className="relative">
                      <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center">
                        <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">Credit or Debit Card</span>
                        <span className="ml-auto text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          Selected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details Form */}
                  <form onSubmit={handlePayment}>
                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Card number
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Expiry Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            MM/YY
                          </label>
                          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                          </div>
                        </div>

                        {/* CVC */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CVC
                          </label>
                          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!stripe || isProcessing}
                      className="w-full mt-6 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatPrice(calculateTotal())}`
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendQuote}
                      disabled={isSendingQuote || isProcessing}
                      className="w-full mt-3 py-3 px-4 border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:disabled:text-gray-500 font-semibold rounded-lg transition-colors duration-200"
                    >
                      {isSendingQuote ? 'Sending quote...' : 'Send quote'}
                    </button>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Email the employer a link to complete this upgrade.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>


          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order summary
                </h3>
                <button
                  onClick={handleEditOrder}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Edit order
                </button>
              </div>

              {/* Plan Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {subscriptionData.planDetails.name}
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {formatPrice(subscriptionData.planDetails.price)}
                  </span>
                </div>

                {/* Applied Coupon */}
                {subscriptionData.appliedCoupon && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Coupon: {subscriptionData.appliedCoupon.title}
                        </span>
                        <span className="text-sm text-green-500 dark:text-green-400">
                          Code: {subscriptionData.appliedCoupon.redemptionCode}
                        </span>
                        {appliedCouponDurationLabel && (
                          <span className="text-sm text-green-500 dark:text-green-400">
                            {appliedCouponDurationLabel}
                          </span>
                        )}
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

                {/* Features */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    What&apos;s included
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {subscriptionData.planDetails.planInclusions.jobPost} Job Posts
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {subscriptionData.planDetails.planInclusions.emailSending.toLocaleString()} Email Sends
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {subscriptionData.planDetails.planInclusions.candidateProfileViews.toLocaleString()} Profile Views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ''}
        message={confirmation.config?.message || ''}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={isSendingQuote}
      />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading payment..." />}>
        <PaymentForm />
      </Suspense>
    </Elements>
  );
}
