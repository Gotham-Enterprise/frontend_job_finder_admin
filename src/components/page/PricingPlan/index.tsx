'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PricingPlan() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToUpgradePlan = () => {
    const employerId = searchParams.get('employerId');
    
    if (!employerId) {
      console.error('EmployerId not found in URL parameters');
      return;
    }
    
    router.push(`/pricing?employerId=${employerId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Pricing Plans</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your pricing plans here.
            </p>
          </div>
          <button
            onClick={navigateToUpgradePlan}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Upgrade Plan
          </button>
        </div>
       
      </div>
    </div>
  );
}