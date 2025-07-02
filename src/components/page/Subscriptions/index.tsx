"use client";
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BackToListButton from '@/components/ui/BackToListButton';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import CreditCardIcon from '@/components/ui/icons/CreditCard';
import { Modal } from '@/components/ui/modal';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import { CheckLineIcon, CloseLineIcon } from '@/icons';
import { useSubscription } from '@/services/hooks/useSubscription';
import { getPlanPrice, getPlanFeatures } from '@/services/utils/planUtils';

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employerId = searchParams.get('employerId');
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  
  const { subscriptionData, loading, error } = useSubscription(employerId);

  const navigateToUpgradePlan = () => {
    router.push(`/pricing?employerId=${employerId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };  const getStatusColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
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

      <div className="mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Subscription Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage subscription plan and billing information
                </p>
              </div>
              <Button
                onClick={navigateToUpgradePlan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Upgrade Plan
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white uppercase">
                    {subscriptionData!.currentPlan}
                  </h2>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    ${subscriptionData!.price.toFixed(2)}
                  </p>
                </div>
                <Badge variant="solid" color={getStatusColor(subscriptionData!.status)} size="md">
                  {subscriptionData!.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Billed monthly - <span className="font-medium text-blue-500">Auto renew</span> 
                  </span>
                </div>                
                <Button 
                  className="padding-0 dark:text-white text-primary whitespace-nowrap" 
                  variant="ghost" 
                  size="lg"
                  onClick={() => setIsViewPlanModalOpen(true)}
                >
                  View plan
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Next payment
                  </h3>                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(subscriptionData!.nextPaymentDate)}
                  </p>
                </div>               
                 <Button 
                  variant="ghost" 
                  className="padding-0 text-primary dark:text-white whitespace-nowrap" 
                  size="lg"
                  onClick={() => setIsCancelSubscriptionModalOpen(true)}
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Company Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Company Name</span>                  <span className="font-medium text-gray-900 dark:text-white">
                    {subscriptionData!.companyName}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="font-medium text-blue-500 dark:text-white">
                    {subscriptionData!.email || 'No email provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Payment Method
              </h3>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <CreditCardIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {subscriptionData!.brand} {subscriptionData!.card}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ••••••••••••{subscriptionData!.last4Digits}
                  </p>
                </div>
              </div>
            </div>
          </div>     
        </div>
      </div>

      {/* View Plan Modal */}
      <Modal 
        isOpen={isViewPlanModalOpen} 
        onClose={() => setIsViewPlanModalOpen(false)}
        isFullscreen={false}
        className="max-w-lg mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your current Plan
            </h2>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subscriptionData!.currentPlan}
                </h3>
              </div>              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${subscriptionData!.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  /month
                </span>
              </div>
            </div>
          </div>          <div className="space-y-3 mb-6">
            {getPlanFeatures(subscriptionData!.currentPlanId).map((feature, index) => (              
            <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckLineIcon className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </div>
            ))}
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
              Cancel subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Once your subscription expires on your next invoice date, you&apos;ll lose access to Gotham Enterprises ltd:
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              'You are unable to post a multiple job',
              'You will loose 100 emails per month',
              'You will loose 100 profile views per month',
              'Limited resume database searches'
            ].map((limitation, index) => (              
            <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CloseLineIcon className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {limitation}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
              variant="ghost" 
              size="default"
               className="flex-1 text-primary dark:text-white dark:hover:bg-primary"
              onClick={() => {
                setIsCancelSubscriptionModalOpen(false);
              }}
            >
              Cancel my subscription
            </Button>
            <Button 
              variant="default" 
              size="default"
               className="flex-1 text-primary dark:text-white dark:hover:bg-primary"
              onClick={() => setIsCancelSubscriptionModalOpen(false)}
            >
              Stay subscribed
            </Button>
           
          </div>
        </div>
      </Modal>
    </div>
  );
}