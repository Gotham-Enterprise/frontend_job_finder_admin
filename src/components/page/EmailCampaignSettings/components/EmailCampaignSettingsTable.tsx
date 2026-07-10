import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import EmailCampaignScheduleModal from "./EmailCampaignSettingsModal";

export interface EmailCampaignSetting {
  id: number;
  campaignKey: string;
  name: string;
  isEnabled: boolean;
  cronSchedule: string;
  scheduleDescription: string;
  timezone: string;
  frequency: string;
  triggerType: string;
  description?: string;
}

interface Props {
  campaigns: EmailCampaignSetting[];
  isLoading: boolean;
  error: Error | null;
  onToggle: (campaignKey: string, isEnabled: boolean) => void;
  onUpdateSchedule: (campaignKey: string, payload: Partial<EmailCampaignSetting>) => void;
}

const EmailCampaignSettingsTable: React.FC<Props> = ({ campaigns, isLoading, error, onToggle, onUpdateSchedule }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaignSetting | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        Loading email campaigns...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error.message}</div>;
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Campaign Settings</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage campaign email schedules without editing cron manually.
            </p>
          </div>

          <Badge variant="light" color="primary">
            {campaigns.length} Campaigns
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40">
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Campaign
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Schedule
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow
                  key={campaign.campaignKey}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  <TableCell className="px-6 py-5">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{campaign.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                      {campaign.description || "No description available."}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Key: {campaign.campaignKey}</div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <Badge variant="light" color={campaign.isEnabled ? "success" : "error"}>
                      {campaign.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="text-sm text-gray-800 dark:text-gray-200 max-w-sm">
                      {campaign.scheduleDescription}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">{campaign.timezone}</div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCampaign(campaign)}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Edit Schedule
                      </button>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={campaign.isEnabled}
                        onClick={() => onToggle(campaign.campaignKey, !campaign.isEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          campaign.isEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            campaign.isEnabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {campaigns.length === 0 && <div className="py-12 text-center text-gray-500">No email campaigns found.</div>}
        </div>
      </div>

      {selectedCampaign && (
        <EmailCampaignScheduleModal
          campaign={selectedCampaign}
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSave={(payload) => {
            onUpdateSchedule(selectedCampaign.campaignKey, payload);
            setSelectedCampaign(null);
          }}
        />
      )}
    </>
  );
};

export default EmailCampaignSettingsTable;
