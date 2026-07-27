import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { EmailCampaignSetting } from "./EmailCampaignSettingsTable";

type RepeatType = "DAILY" | "WEEKDAYS" | "WEEKLY" | "MONTHLY" | "CUSTOM";
type Period = "AM" | "PM";

const EST_TIMEZONE = "America/New_York";
const EST_LABEL = "Eastern Time";

const DAY_OPTIONS = [
  { label: "Sunday", short: "Sun", value: 0 },
  { label: "Monday", short: "Mon", value: 1 },
  { label: "Tuesday", short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday", short: "Thu", value: 4 },
  { label: "Friday", short: "Fri", value: 5 },
  { label: "Saturday", short: "Sat", value: 6 },
];

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface Props {
  campaign: EmailCampaignSetting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<EmailCampaignSetting>) => void;
}

function parseTimePartsFromCron(cron: string) {
  const [minute = "0", hour = "13"] = cron.split(" ");

  const hour24 = Number(hour);
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return {
    hour: hour12,
    minute: String(minute).padStart(2, "0"),
    period,
  };
}

function getDaysFromCron(cron: string): number[] {
  const dayOfWeek = cron.split(" ")[4];

  if (!dayOfWeek || dayOfWeek === "*") return [0, 1, 2, 3, 4, 5, 6];
  if (dayOfWeek === "1-5") return [1, 2, 3, 4, 5];

  return dayOfWeek
    .split(",")
    .map(Number)
    .filter((day) => day >= 0 && day <= 6);
}

function detectRepeatType(campaign: EmailCampaignSetting): RepeatType {
  if (campaign.frequency === "MONTHLY") return "MONTHLY";
  if (campaign.frequency === "DAILY") return "DAILY";
  if (campaign.frequency === "WEEKDAYS") return "WEEKDAYS";
  if (campaign.frequency === "CUSTOM") return "CUSTOM";
  if (campaign.frequency === "WEEKLY") return "WEEKLY";

  const dayOfWeek = campaign.cronSchedule.split(" ")[4];

  if (dayOfWeek === "*") return "DAILY";
  if (dayOfWeek === "1-5") return "WEEKDAYS";
  if (dayOfWeek?.includes(",")) return "CUSTOM";

  return "WEEKLY";
}

function convertTo24Hour(hour: number, period: Period) {
  if (period === "AM") return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
}

function formatTime(hour: number, minute: string, period: Period) {
  return `${hour}:${minute} ${period}`;
}

function buildCron({
  repeatType,
  hour,
  minute,
  period,
  selectedDays,
}: {
  repeatType: RepeatType;
  hour: number;
  minute: string;
  period: Period;
  selectedDays: number[];
}) {
  const hour24 = convertTo24Hour(hour, period);

  if (repeatType === "DAILY") {
    return `${Number(minute)} ${hour24} * * *`;
  }

  if (repeatType === "WEEKDAYS") {
    return `${Number(minute)} ${hour24} * * 1-5`;
  }

  const days = selectedDays.length > 0 ? selectedDays.sort().join(",") : "1";

  return `${Number(minute)} ${hour24} * * ${days}`;
}

function buildScheduleDescription({
  repeatType,
  hour,
  minute,
  period,
  selectedDays,
}: {
  repeatType: RepeatType;
  hour: number;
  minute: string;
  period: Period;
  selectedDays: number[];
}) {
  const formattedTime = formatTime(hour, minute, period);

  if (repeatType === "DAILY") {
    return `Runs every day at ${formattedTime} ${EST_LABEL}.`;
  }

  if (repeatType === "WEEKDAYS") {
    return `Runs Monday to Friday at ${formattedTime} ${EST_LABEL}.`;
  }

  const dayLabels = selectedDays
    .sort()
    .map((day) => DAY_OPTIONS.find((item) => item.value === day)?.label)
    .filter(Boolean)
    .join(", ");

  if (repeatType === "MONTHLY") {
    return `Runs on the first ${dayLabels} of the month at ${formattedTime} ${EST_LABEL}.`;
  }

  return `Runs every ${dayLabels} at ${formattedTime} ${EST_LABEL}.`;
}

const disabledInputClass =
  "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:disabled:border-gray-700";

const EmailCampaignScheduleModal: React.FC<Props> = ({ campaign, isOpen, onClose, onSave }) => {
  const parsedTime = parseTimePartsFromCron(campaign.cronSchedule);

  const [isEnabled, setIsEnabled] = useState(campaign.isEnabled);
  const [repeatType, setRepeatType] = useState<RepeatType>(detectRepeatType(campaign));
  const [hour, setHour] = useState(parsedTime.hour);
  const [minute, setMinute] = useState(parsedTime.minute);
  const [period, setPeriod] = useState<Period>(parsedTime.period);
  const [selectedDays, setSelectedDays] = useState<number[]>(getDaysFromCron(campaign.cronSchedule));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isScheduleEditable = isEnabled;

  const isMonthlyFirstWeek =
    campaign.campaignKey === "jobSeekerTipsEmail" || campaign.campaignKey === "promoteBlogEmail";

  const cronSchedule = useMemo(
    () =>
      buildCron({
        repeatType,
        hour,
        minute,
        period,
        selectedDays,
      }),
    [repeatType, hour, minute, period, selectedDays]
  );

  const scheduleDescription = useMemo(
    () =>
      buildScheduleDescription({
        repeatType,
        hour,
        minute,
        period,
        selectedDays,
      }),
    [repeatType, hour, minute, period, selectedDays]
  );

  const handleDayToggle = (day: number) => {
    if (!isScheduleEditable) return;

    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        const next = prev.filter((item) => item !== day);
        return next.length > 0 ? next : prev;
      }

      return [...prev, day].sort();
    });
  };

  const handleRepeatChange = (value: RepeatType) => {
    if (!isScheduleEditable) return;

    setRepeatType(value);

    if (value === "DAILY") setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    if (value === "WEEKDAYS") setSelectedDays([1, 2, 3, 4, 5]);
    if ((value === "WEEKLY" || value === "MONTHLY") && selectedDays.length !== 1) {
      setSelectedDays([1]);
    }
  };

  const handleSave = () => {
    onSave({
      isEnabled,
      cronSchedule,
      scheduleDescription,
      timezone: EST_TIMEZONE,
      frequency:
        repeatType === "DAILY"
          ? "DAILY"
          : repeatType === "WEEKDAYS"
            ? "WEEKDAYS"
            : repeatType === "WEEKLY"
              ? "WEEKLY"
              : repeatType === "MONTHLY"
                ? "MONTHLY"
                : "CUSTOM",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-4 my-4 rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex max-h-[85vh] flex-col bg-white dark:bg-gray-900">
        <div className="shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Campaign Schedule</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{campaign.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Campaign Status</div>
                <div className="text-xs text-gray-500">Turn this campaign on or off.</div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    isEnabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {!isScheduleEditable && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/10 dark:text-yellow-300">
              Schedule editing is disabled while this campaign is turned off. Turn it on to update the schedule.
            </div>
          )}

          <div className={`space-y-6 ${!isScheduleEditable ? "opacity-60" : ""}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repeat</label>
              <select
                value={repeatType}
                disabled={!isScheduleEditable}
                onChange={(e) => handleRepeatChange(e.target.value as RepeatType)}
                className={`h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white ${disabledInputClass}`}
              >
                <option value="DAILY">Every day</option>
                <option value="WEEKDAYS">Weekdays, Monday to Friday</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CUSTOM">Custom days</option>
              </select>
            </div>

            {(repeatType === "WEEKLY" || repeatType === "MONTHLY" || repeatType === "CUSTOM") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select days</label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAY_OPTIONS.map((day) => {
                    const isChecked = selectedDays.includes(day.value);
                    const isSingleSelect = repeatType === "WEEKLY" || repeatType === "MONTHLY";

                    return (
                      <label
                        key={day.value}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isScheduleEditable ? "cursor-pointer" : "cursor-not-allowed"
                        } ${
                          isChecked
                            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-300"
                            : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={!isScheduleEditable}
                          checked={isChecked}
                          onChange={() => {
                            if (isSingleSelect) {
                              if (isScheduleEditable) {
                                setSelectedDays([day.value]);
                              }
                            } else {
                              handleDayToggle(day.value);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed"
                        />
                        {day.short}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Run Time</label>

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={hour}
                  disabled={!isScheduleEditable}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className={`h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white ${disabledInputClass}`}
                >
                  {HOUR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={minute}
                  disabled={!isScheduleEditable}
                  onChange={(e) => setMinute(e.target.value)}
                  className={`h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white ${disabledInputClass}`}
                >
                  {MINUTE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={period}
                  disabled={!isScheduleEditable}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className={`h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white ${disabledInputClass}`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <p className="mt-2 text-xs text-gray-500">Timezone: Eastern Time</p>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/10 dark:border-green-900/40">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">Schedule Preview</div>
            <div className="mt-1 text-sm text-green-700 dark:text-green-400">
              {isEnabled ? scheduleDescription : "This campaign is disabled and will not run."}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
          </button>

          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generated Cron Expression
              </label>
              <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {cronSchedule}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex justify-end gap-3 p-4 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailCampaignScheduleModal;
