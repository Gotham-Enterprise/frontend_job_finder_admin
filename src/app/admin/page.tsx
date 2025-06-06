import type { Metadata } from "next";
import { JobMetrics } from "@/components/job-statistics/JobMetrics";
import React from "react";
import TopEmployers from "@/components/job-statistics/TopEmployers";
import JobApplicationTrends from "@/components/job-statistics/JobApplicationTrends";
import CategoryDistribution from "@/components/job-statistics/CategoryDistribution";
import Image from "next/image";
import { UserGreeting } from "@/components/admin/UserGreeting";

export const metadata: Metadata = {
  title:
    "Admin Dashboard",
  description: "Admin",
};

export default function Admin() {  return (
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
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <JobMetrics />
  
          <JobApplicationTrends />
        </div>
  
        <div className="col-span-12 xl:col-span-5">
          <TopEmployers />
        </div>
  
        <div className="col-span-12">
          <CategoryDistribution />
        </div>
  
      </div>
  </>
  );
}
