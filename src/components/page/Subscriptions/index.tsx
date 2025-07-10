"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BackToListButton from '@/components/ui/BackToListButton';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import CreditCardIcon from '@/components/ui/icons/CreditCard';
import { Modal } from '@/components/ui/modal';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { CheckLineIcon, CloseLineIcon } from '@/icons';
import { useToast } from '@/context/ToastContext';
import { useSubscriptionByCompany } from '@/services/hooks/useSubscriptionByCompany';
import { useSubscriptionContext } from '@/context/SubscriptionContext';
import { formatDateTime } from '@/services/utils/dateUtils';
import { formatInterval } from '@/services/utils/planUtils';
import { subscriptionApi } from '@/services/api/subscription';

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employerId = searchParams.get('employerId');
  const success = searchParams.get('success');
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const { addToast } = useToast();
  const { copyToClipboard } = useSubscriptionContext();
  
  const { subscriptionData, loading, error } = useSubscriptionByCompany(employerId);

  const handleCopyRedemptionCode = async (redemptionCode: string) => {
    try {
      await copyToClipboard(redemptionCode, 'Redemption Code');
      addToast({
        variant: 'success',
        title: 'Copied!',
        message: 'Redemption code copied to clipboard',
        duration: 3000,
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy redemption code',
        duration: 3000,
      });
    }
  };

  const handleCopyCompanyId = async (companyId: string) => {
    try {
      await copyToClipboard(companyId, 'Company ID');
      addToast({
        variant: 'success',
        title: 'Copied!',
        message: 'Company ID copied to clipboard',
        duration: 3000,
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy company ID',
        duration: 3000,
      });
    }
  };

  const cancelSubscription = async () => {
    if (!subscriptionData?.company.id) {
      addToast({
        variant: 'error',
        title: 'Error',
        message: 'Company ID not found',
        duration: 3000,
      });
      return;
    }

    try {
      setIsCancellingSubscription(true);
      const response = await subscriptionApi.cancelSubscription(subscriptionData.company.id);
      
      if (response.success) {
        addToast({
          variant: 'success',
          title: 'Subscription Cancelled',
          message: response.message || 'Subscription has been successfully cancelled',
          duration: 5000,
        });
        setIsConfirmCancelModalOpen(false);
        setIsCancelSubscriptionModalOpen(false);
        window.location.reload();
      } else {
        addToast({
          variant: 'error',
          title: 'Cancellation Failed',
          message: response.message || 'Failed to cancel subscription',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Error',
        message: 'An error occurred while cancelling the subscription',
        duration: 5000,
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleShowCancelConfirmation = () => {
    setIsCancelSubscriptionModalOpen(false);
    setIsConfirmCancelModalOpen(true);
  };

  useEffect(() => {
    if (success === 'true') {
      addToast({
        variant: 'success',
        title: 'Subscription Successful!',
        message: 'Your subscription has been activated and is now ready to use.',
        duration: 8000,
      });
      
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('success');
      router.replace(`/admin/subscriptions?${newSearchParams.toString()}`);
    }
  }, [success, addToast, router, searchParams]);

  const navigateToUpgradePlan = () => {
    router.push(`/pricing?employerId=${employerId}`);
  };

  const formatLocalDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDiscountAmount = (amountOffInCents: number | null, percentOff: number | null) => {
    if (amountOffInCents) {
      return `$${(amountOffInCents / 100).toFixed(2)} off`;
    }
    if (percentOff) {
      return `${percentOff}% off`;
    }
    return 'No discount';
  };

  const formatCardExpiry = (expMonth: number, expYear: number) => {
    return `${expMonth.toString().padStart(2, '0')}/${expYear.toString().slice(-2)}`;
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const getStatusColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'error';
      default:
        return 'light';
    }
  };

  const getUsagePercentage = (used: number, credit: number | null) => {
    if (!credit || credit === 9999999) return 0; // Unlimited plans
    return Math.min((used / credit) * 100, 100);
  };

  const formatCredit = (credit: number | null) => {
    if (!credit || credit === 9999999) return 'Unlimited';
    return credit.toLocaleString();
  };



  const canCancelSubscription = subscriptionData && subscriptionData.currentPlan.priceInCents > 0;

  if (loading) {
    return <FullScreenSpinner isVisible={true} message="Loading subscription details..." />;
  }

  if (error || !subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 pt-4 pb-2">
          <BackToListButton href="/admin/employers">
            Back to Employers
          </BackToListButton>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">{error || 'Subscription data not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/employers">
          Back to Employers
        </BackToListButton>
      </div>

      <div className="mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Subscription Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage subscription plan and billing information for {subscriptionData.company.name}
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="solid" color={getStatusColor(subscriptionData.status)} size="md">
                    {subscriptionData.status}
                  </Badge>
                  {subscriptionData.currentPlan.isTrialPlan && (
                    <Badge variant="light" color="info" size="md">
                      Trial Plan
                    </Badge>
                  )}
                  {subscriptionData.isFeaturedEmployer && (
                    <Badge variant="solid" color="warning" size="md">
                      Featured Employer
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={navigateToUpgradePlan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Upgrade Plan
              </Button>
            </div>
          </div>

          {/* Current Plan Overview */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {subscriptionData.currentPlan.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {subscriptionData.currentPlan.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(subscriptionData.currentPlan.priceInCents)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      per {formatInterval(subscriptionData.currentPlan.interval)}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setIsViewPlanModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    View Plan Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Posts Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Posts</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.jobPostsUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.jobPostCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.jobPostCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.jobPostsUsed, subscriptionData.currentPlan.jobPostCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Resume Search Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resume Search</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.resumeSearchUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.resumeSearchCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.resumeSearchCredit && subscriptionData.currentPlan.resumeSearchCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.resumeSearchUsed, subscriptionData.currentPlan.resumeSearchCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Views Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Views</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.profileViewsUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.profileViewsCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.profileViewsCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.profileViewsUsed, subscriptionData.currentPlan.profileViewsCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Email Sending Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Sending</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.emailSendingUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.emailSendingCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.emailSendingCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.emailSendingUsed, subscriptionData.currentPlan.emailSendingCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Resume Download Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resume Downloads</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.resumeDownloadUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.resumeDownloadCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.resumeDownloadCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.resumeDownloadUsed, subscriptionData.currentPlan.resumeDownloadCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Seats Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Seats</h3>
              <div className="p-2 bg-primary rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.employeesSeatsUsed}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {formatCredit(subscriptionData.currentPlan.employeesSeatsCredit)}
                </span>
              </div>
              {subscriptionData.currentPlan.employeesSeatsCredit !== 9999999 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(subscriptionData.employeesSeatsUsed, subscriptionData.currentPlan.employeesSeatsCredit)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coupon and Payment Method Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coupon Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Coupon Details</h3>
            {subscriptionData.coupon ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Coupon Title</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subscriptionData.coupon.title}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Description</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
                    {subscriptionData.coupon.description}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Redemption Code</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                      {subscriptionData.coupon.redemptionCode}
                    </span>
                    <button
                      onClick={() => subscriptionData.coupon && handleCopyRedemptionCode(subscriptionData.coupon.redemptionCode)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Copy redemption code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Discount Amount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatDiscountAmount(subscriptionData.coupon.amountOffInCents, subscriptionData.coupon.percentOff)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subscriptionData.coupon.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Currency</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subscriptionData.coupon.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Admin Only</span>
                  <Badge variant="solid" color={subscriptionData.coupon.isOnlyAdminCanApply ? "success" : "light"} size="sm">
                    {subscriptionData.coupon.isOnlyAdminCanApply ? "Yes" : "No"}
                  </Badge>
                </div>
                {subscriptionData.coupon.createdAt && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(subscriptionData.coupon.createdAt)}
                    </span>
                  </div>
                )}
                {subscriptionData.coupon.updatedAt && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Updated</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(subscriptionData.coupon.updatedAt)}
                    </span>
                  </div>
                )}
                {subscriptionData.coupon.deactivatedAt && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 dark:text-gray-400">Deactivated</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {formatDateTime(subscriptionData.coupon.deactivatedAt)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No coupon applied</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Payment Method Details</h3>
            {subscriptionData.currentPaymentMethod ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Card Brand</span>
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {subscriptionData.currentPaymentMethod.brand}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Card Number</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    •••• •••• •••• {subscriptionData.currentPaymentMethod.last4Digits}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Expiry Date</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {formatCardExpiry(subscriptionData.currentPaymentMethod.expMonth, subscriptionData.currentPaymentMethod.expYear)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Default Card</span>
                  <Badge variant="solid" color={subscriptionData.currentPaymentMethod.isDefault ? "success" : "light"} size="sm">
                    {subscriptionData.currentPaymentMethod.isDefault ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Added</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(subscriptionData.currentPaymentMethod.createdAt)}
                  </span>
                </div>
                {subscriptionData.currentPaymentMethod.updatedAt && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 dark:text-gray-400">Updated</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(subscriptionData.currentPaymentMethod.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No payment method configured</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Billing Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Billing Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Subscription Start</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatLocalDate(subscriptionData.currentSubscriptionStartDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Subscription End</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatLocalDate(subscriptionData.currentSubscriptionEndDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Next Payment</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatLocalDate(subscriptionData.nextPaymentDate)}
                </span>
              </div>
              {subscriptionData.schedulledDowngradeDate && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Scheduled Downgrade</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {formatLocalDate(subscriptionData.schedulledDowngradeDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Company Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Company Name</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscriptionData.company.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">Company ID</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                    {subscriptionData.company.id}
                  </span>
                  <button
                    onClick={() => handleCopyCompanyId(subscriptionData.company.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Copy company ID"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-center">
            {canCancelSubscription ? (
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" 
                size="lg"
                onClick={() => setIsCancelSubscriptionModalOpen(true)}
                disabled={isCancellingSubscription}
              >
                Cancel Subscription
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {subscriptionData?.currentPlan.priceInCents === 0 
                    ? 'No subscription' 
                    : 'No active paid subscription'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Plan Modal */}
      <Modal 
        isOpen={isViewPlanModalOpen} 
        onClose={() => setIsViewPlanModalOpen(false)}
        isFullscreen={false}
        className="max-w-2xl mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {subscriptionData.currentPlan.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {subscriptionData.currentPlan.description}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(subscriptionData.currentPlan.priceInCents)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  per {formatInterval(subscriptionData.currentPlan.interval)}
                </span>
              </div>
              <div className="space-x-2">
                {subscriptionData.currentPlan.isTrialPlan && (
                  <Badge variant="light" color="info">Trial Plan</Badge>
                )}
                {subscriptionData.currentPlan.isActive && (
                  <Badge variant="solid" color="success">Active</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Plan Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.jobPostCredit)} Job Posts
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.resumeSearchCredit)} Resume Searches
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.profileViewsCredit)} Profile Views
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.emailSendingCredit)} Email Sends
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.resumeDownloadCredit)} Resume Downloads
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredit(subscriptionData.currentPlan.employeesSeatsCredit)} Employee Seats
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Current Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Job Posts</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.jobPostsUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Resume Searches</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.resumeSearchUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profile Views</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.profileViewsUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Email Sends</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.emailSendingUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Resume Downloads</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.resumeDownloadUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Employee Seats</span>
                  <span className="text-gray-900 dark:text-white">{subscriptionData.employeesSeatsUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal 
        isOpen={isCancelSubscriptionModalOpen} 
        onClose={() => setIsCancelSubscriptionModalOpen(false)}
        isFullscreen={false}
        className="max-w-lg mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Cancel Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel this subscription? This action will take effect at the end of the current billing period.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">You will lose access to:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CloseLineIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">Job posting capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <CloseLineIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">Resume search and download</span>
                </div>
                <div className="flex items-center gap-3">
                  <CloseLineIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">Email sending features</span>
                </div>
                <div className="flex items-center gap-3">
                  <CloseLineIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">Advanced analytics and reporting</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="text-primary" 
              size="default"
              className="flex-1"
              onClick={() => setIsCancelSubscriptionModalOpen(false)}
              disabled={isCancellingSubscription}
            >
              Keep Subscription
            </Button>
            <Button 
              variant="outline" 
              size="default"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleShowCancelConfirmation}
              disabled={isCancellingSubscription}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal 
        isOpen={isConfirmCancelModalOpen} 
        onClose={() => setIsConfirmCancelModalOpen(false)}
        isFullscreen={false}
        className="max-w-md mx-4"
      >
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Confirm Cancellation?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This action cannot be undone. The subscription will be cancelled immediately and access will be revoked at the end of the current billing period.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> Once cancelled, you'll need to purchase a new subscription to regain access to premium features.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="ghost" 
              size="default"
              className="flex-1"
              onClick={() => {
                setIsConfirmCancelModalOpen(false);
                setIsCancelSubscriptionModalOpen(true);
              }}
              disabled={isCancellingSubscription}
            >
              Go Back
            </Button>
            <Button 
              variant="default" 
              size="default"
              className="flex-1 bg-primary text-white hover:bg-primary/90 whitespace-nowrap"
              onClick={cancelSubscription}
              disabled={isCancellingSubscription}
            >
              {isCancellingSubscription ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cancelling...
                </div>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}