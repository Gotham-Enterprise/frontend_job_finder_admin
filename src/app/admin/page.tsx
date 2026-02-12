"use client";
import { JobMetrics } from "@/components/job-statistics/JobMetrics";
import React, { useState } from "react";
import TopEmployers from "@/components/job-statistics/TopEmployers";
import JobApplicationTrends from "@/components/job-statistics/JobApplicationTrends";
import JobseekerTrends from "@/components/job-statistics/JobseekerTrends";
import CategoryDistribution from "@/components/job-statistics/CategoryDistribution";
import Image from "next/image";
import { UserGreeting } from "@/components/admin/UserGreeting";

export default function Admin() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex flex-grow justify-between relative items-center mb-10 bg-secondary items-center h-30 justify-between overflow-hidden rounded-2xl dark:border-gray-800 dark:bg-primary px-10">
        <UserGreeting />
        <button
          onClick={handleRefresh}
          className="absolute right-48 top-5 z-10 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Refresh Dashboard"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <div className="absolute right-5 top-5 z-2">
          <Image
            src="/images/cards/greatings-img.svg"
            alt="Greeting"
            width={168}
            height={123}
            priority
          />
        </div>
      </div>


      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <JobMetrics key={`metrics-${refreshKey}`} refreshKey={refreshKey} />
          <JobseekerTrends key={`jobseeker-trends-${refreshKey}`} refreshKey={refreshKey} />
          
        </div>

        <div className="col-span-12 xl:col-span-5">
          <TopEmployers />
        </div>

        <div className="col-span-12">
          <JobApplicationTrends key={`trends-${refreshKey}`} refreshKey={refreshKey} />
        </div>

        <div className="col-span-12">
          <CategoryDistribution key={`category-${refreshKey}`} refreshKey={refreshKey} />
        </div>

      </div>
    </>
  );
}
