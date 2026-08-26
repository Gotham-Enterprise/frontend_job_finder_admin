"use client";

import React, { useState } from "react";
import OfficeSpaceInquiriesList from "@/components/page/OfficeSpaceAdmin/OfficeSpaceInquiries";

export default function OfficeSpaceInquiriesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Office Space Inquiries
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View all tenant inquiries across listings
        </p>
      </div>
      <OfficeSpaceInquiriesList
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
