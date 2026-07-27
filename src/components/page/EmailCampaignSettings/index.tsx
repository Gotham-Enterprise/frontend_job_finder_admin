"use client";

import React from "react";
import EmailCampaignSettingsHeader from "./components/EmailCampaignSettingsHeader";
import EmailCampaignSettingsTable from "./components/EmailCampaignSettingsTable";
import { useEmailCampaignSettingsLogic } from "@/services/hooks/useEmailCampaignSettingsLogic";
import ErrorState from "../../common/ErrorState";
import { BoltIcon } from "@/icons";

const EmailCampaignSettings = () => {
  const { campaigns, isLoading, error, refetch, onSearch, toggleCampaign, updateCampaignSchedule } =
    useEmailCampaignSettingsLogic();

  if (error && !isLoading) {
    return (
      <ErrorState
        message={`Error loading email campaign settings: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EmailCampaignSettingsHeader onSearch={onSearch} />

      <EmailCampaignSettingsTable
        campaigns={campaigns}
        isLoading={isLoading}
        error={error}
        onToggle={toggleCampaign}
        onUpdateSchedule={updateCampaignSchedule}
      />
    </div>
  );
};

export default EmailCampaignSettings;
