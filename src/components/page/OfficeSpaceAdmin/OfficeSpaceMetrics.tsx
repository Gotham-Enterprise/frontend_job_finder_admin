"use client";

import React from "react";
import { Building2, Clock, MessageSquare, Users, Eye, TrendingUp } from "lucide-react";
import { useOfficeSpaceStats } from "@/services/hooks/useOfficeSpaceAdmin";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ErrorState from "@/components/common/ErrorState";

const OfficeSpaceMetrics: React.FC = () => {
  const { data, isLoading, error } = useOfficeSpaceStats();

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading office space stats..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={`Error loading stats: ${(error as Error).message}`}
        showRetryButton={false}
      />
    );
  }

  const stats = data?.data;
  if (!stats) return null;

  const cards = [
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Total Listings",
      value: stats.totalListings,
      subtitle: `${stats.activeListings} active`,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Pending Review",
      value: stats.pendingReview,
      subtitle: "Awaiting approval",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Total Inquiries",
      value: stats.totalInquiries,
      subtitle: "All time",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Total Landlords",
      value: stats.totalLandlords,
      subtitle: "Registered accounts",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Active Listings",
      value: stats.activeListings,
      subtitle: "Currently visible",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      subtitle: "Estimated monthly",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-400">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfficeSpaceMetrics;
