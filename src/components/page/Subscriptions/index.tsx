"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import BackToListButton from '@/components/ui/BackToListButton';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import CreditCardIcon from '@/components/ui/icons/CreditCard';

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const employerId = searchParams.get('employerId');

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Subscription Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage subscription plan and billing information
            </p>
          </div>

        
          <div className="p-8 space-y-6">
         
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    SMALL BUSINESS PLAN
                  </h2>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    $399.00
                  </p>
                </div>
                <Badge variant="solid" color="success" size="md">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Billed monthly - <span className="font-medium text-blue-500">Auto renew</span> 
                  </span>
                </div>
                <Button className="dark:text-white text-primary whitespace-nowrap" variant="ghost" size="lg">
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
                    October 23, 2024
                  </p>
                </div>
                <Button variant="ghost" className="text-primary dark:text-white whitespace-nowrap" size="lg">
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
                  <span className="text-gray-600 dark:text-gray-400">Company Name</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Healthcare LTD.
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="font-medium text-blue-500 dark:text-white">
                    sample@mail.com
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
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Credit Card
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ••••••••••••1234
                  </p>
                </div>
                
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button variant="default" size="default">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}