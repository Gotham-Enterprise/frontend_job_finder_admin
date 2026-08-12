"use client";

import { FC } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { formatEasternTime } from "../helpers";
import {
  AdminScheduler,
  addDays,
  easternTodayKey,
  parseDateKey,
  startOfWeek,
  toDateKey,
} from "./useAdminScheduler";

interface AdminSchedulerPanelProps {
  scheduler: AdminScheduler;
  // Marks the appointment's existing slot when rescheduling
  currentAppointmentStartAt?: string;
}

const monthYearFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short" });

const AdminSchedulerPanel: FC<AdminSchedulerPanelProps> = ({ scheduler, currentAppointmentStartAt }) => {
  const {
    availableDates,
    dateAvailability,
    weekStart,
    setWeekStart,
    selectedDate,
    selectDate,
    timeSlots,
    isLoadingSlots,
    selectedSlot,
    setSelectedSlot,
  } = scheduler;

  const availableDateSet = new Set(availableDates);
  const today = parseDateKey(easternTodayKey());
  // Monday–Friday only; the backend never offers weekend slots
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i + 1));
  const isPrevWeekDisabled = startOfWeek(today).getTime() >= weekStart.getTime();

  const firstDay = weekDays[0];
  const lastDay = weekDays[weekDays.length - 1];
  const sameMonth = firstDay.getMonth() === lastDay.getMonth() && firstDay.getFullYear() === lastDay.getFullYear();
  const monthLabel = sameMonth
    ? monthYearFormat.format(firstDay)
    : `${monthYearFormat.format(firstDay)} - ${monthYearFormat.format(lastDay)}`;

  return (
    <div>
      <p className="mb-3 font-semibold text-gray-900 dark:text-white">{monthLabel}</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          disabled={isPrevWeekDisabled}
          aria-label="Previous week"
          className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="grid flex-1 grid-cols-5 gap-2">
          {weekDays.map((day) => {
            const dateKey = toDateKey(day);
            const isFullyBooked = dateAvailability[dateKey] === false;
            const isAvailable = availableDateSet.has(dateKey) && !isFullyBooked;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => selectDate(dateKey)}
                disabled={!isAvailable}
                aria-pressed={isSelected}
                title={isFullyBooked ? "Fully booked" : undefined}
                className={`flex flex-col items-center rounded-lg border py-2.5 transition-colors ${
                  isSelected
                    ? "border-brand-500 border-2 text-gray-900 dark:text-white"
                    : isAvailable
                      ? "border-gray-200 text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:text-white"
                      : "cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600"
                }`}
              >
                <span className="text-xs uppercase">{weekdayFormat.format(day)}</span>
                <span className="text-lg font-semibold">{day.getDate()}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          aria-label="Next week"
          className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">All times are Eastern Time (US &amp; Canada)</p>

      <div className="mt-3">
        {isLoadingSlots && timeSlots.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading available times...</p>
        ) : timeSlots.length > 0 ? (
          // Keep the previous slots visible (dimmed) while the next date loads,
          // so fast responses don't flash the loading state
          <div
            className={`grid grid-cols-3 gap-2 sm:grid-cols-4 transition-opacity ${
              isLoadingSlots ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {timeSlots.map((slot) => {
              const isCurrent = slot.startAt === currentAppointmentStartAt;
              const isSelected = selectedSlot?.startAt === slot.startAt;

              return (
                <button
                  key={slot.startAt}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={isSelected}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                    isCurrent
                      ? "cursor-not-allowed border-gray-100 text-gray-400 dark:border-gray-700"
                      : isSelected
                        ? "border-brand-500 border-2 text-brand-500"
                        : "border-gray-200 text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:text-white"
                  }`}
                >
                  {formatEasternTime(slot.startAt)}
                  {isCurrent && <span className="block text-xs font-normal">Current</span>}
                </button>
              );
            })}
          </div>
        ) : selectedDate ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No available times on this date. Please select another date.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default AdminSchedulerPanel;
