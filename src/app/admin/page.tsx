"use client";
import { JobMetrics } from "@/components/job-statistics/JobMetrics";
import React, { useEffect, useState } from "react";
import TopEmployers from "@/components/job-statistics/TopEmployers";
import JobApplicationTrends from "@/components/job-statistics/JobApplicationTrends";
import JobseekerTrends from "@/components/job-statistics/JobseekerTrends";
import CategoryDistribution from "@/components/job-statistics/CategoryDistribution";
import Image from "next/image";
import { UserGreeting } from "@/components/admin/UserGreeting";
import { DASHBOARD_REFRESH_EVENT } from "@/components/header/DashboardRefreshButton";

export default function Admin() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener(DASHBOARD_REFRESH_EVENT, handleRefresh);

    return () => {
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  return (
    <>
      <div className="flex flex-grow justify-between relative items-center mb-10 bg-secondary items-center h-30 justify-between overflow-hidden rounded-2xl dark:border-gray-800 dark:bg-primary px-10">
        <UserGreeting />
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
        <div className="col-span-12">
          <JobMetrics key={`metrics-${refreshKey}`} refreshKey={refreshKey} />
        </div>

        <div className="col-span-12">
          <JobseekerTrends key={`jobseeker-trends-${refreshKey}`} refreshKey={refreshKey} />
        </div>

        <div className="col-span-12">
          <JobApplicationTrends key={`trends-${refreshKey}`} refreshKey={refreshKey} />
        </div>

        <div className="col-span-12">
          <CategoryDistribution key={`category-${refreshKey}`} refreshKey={refreshKey} />
        </div>

        <div className="col-span-12">
          <TopEmployers />
        </div>

      </div>
    </>
  );
}
