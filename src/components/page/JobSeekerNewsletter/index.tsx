"use client";

import React from "react";
import NewsletterSubscribersHeader from "./components/NewsletterSubscribersHeader";
import NewsletterToggleCard from "./components/NewsletterToggleCard";
import NewsletterOverviewStats from "./components/NewsletterOverviewStats";
import NewsletterSendLogsTable from "./components/NewsletterSendLogsTable";
import NewsletterSubscribersFilters from "./components/NewsletterSubscribersFilters";
import NewsletterSubscribersTable from "./components/NewsletterSubscribersTable";
import NewsletterSubscribersTablePagination from "./components/NewsletterSubscribersTablePagination";
import { useNewsletterSubscribersLogic } from "@/services/hooks/useNewsletterSubscribersLogic";

const JobSeekerNewsletter = () => {
  const logic = useNewsletterSubscribersLogic();

  return (
    <div className="space-y-6">
      <NewsletterSubscribersHeader total={logic.data?.total ?? 0} />

      <NewsletterToggleCard
        isEnabled={logic.overview?.isEnabled ?? false}
        isUpdating={logic.isUpdatingToggle}
        onChange={logic.toggleEnabled}
      />

      <NewsletterOverviewStats overview={logic.overview} />

      <NewsletterSendLogsTable
        logs={logic.logs?.logs ?? []}
        total={logic.logs?.total ?? 0}
        page={logic.logsPage}
        totalPages={logic.logsTotalPages}
        onPageChange={logic.setLogsPage}
        isLoading={logic.logsIsLoading}
      />

      <NewsletterSubscribersFilters
        search={logic.filters.search || ""}
        onSearchChange={logic.setSearch}
        occupationId={logic.filters.occupationId}
        onOccupationChange={logic.setOccupationId}
        city={logic.filters.city || ""}
        onCityChange={logic.setCity}
        state={logic.filters.state || ""}
        onStateChange={logic.setState}
        status={logic.filters.status}
        onStatusChange={logic.setStatus}
        onClear={logic.clearFilters}
      />

      <NewsletterSubscribersTable
        subscribers={logic.data?.subscribers ?? []}
        isLoading={logic.isLoading}
        error={logic.error}
        isUnsubscribing={logic.isUnsubscribing}
        onUnsubscribe={logic.unsubscribe}
      />

      <NewsletterSubscribersTablePagination
        currentPage={logic.filters.page || 1}
        totalPages={logic.totalPages}
        onPageChange={logic.pageChange}
      />
    </div>
  );
};

export default JobSeekerNewsletter;
