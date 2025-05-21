import type { Metadata } from "next";
import { JobMetrics } from "@/components/job-statistics/JobMetrics";
import React from "react";
import TopEmployers from "@/components/job-statistics/TopEmployers";
import JobApplicationTrends from "@/components/job-statistics/JobApplicationTrends";
import CategoryDistribution from "@/components/job-statistics/CategoryDistribution";


export const metadata: Metadata = {
  title:
    "Admin Dashboard",
  description: "Admin",
};

export default function Ecommerce() {
  return (
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
  );
}
