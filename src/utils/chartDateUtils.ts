/**
 * Chart date utilities for the admin analytics charts.
 *
 * All heavy computation (bucket generation, grouping, labels) happens on the
 * backend. This module handles the thin layer of date work the frontend owns:
 *   1. Converting a flatpickr-selected Date to a YYYY-MM-DD string WITHOUT
 *      the UTC-shift bug that toISOString() causes for positive-offset
 *      timezones (e.g. Asia/Manila, Australia/Sydney).
 *   2. Typed helpers for building the date-range query params sent to the API.
 */

export type RangePreset = "24h" | "7d" | "28d" | "3m" | "6m" | "9m" | "1y" | "custom";

export interface CustomDateRange {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}

/**
 * Format a Date as YYYY-MM-DD using the *local* calendar date, not UTC.
 *
 * Motivation: `new Date("2026-04-03").toISOString()` shifts the date backward
 * for any timezone that is ahead of UTC (e.g. Asia/Manila UTC+8 turns Apr 3
 * midnight into "2026-04-02T16:00:00Z", yielding "2026-04-02" after split).
 * Using local getters avoids this entirely.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Build the custom-range query params from a pair of flatpickr Date objects.
 * The start is the inclusive first day; the end is the inclusive last day.
 * Both are expressed as YYYY-MM-DD strings in local time.
 *
 * The backend interprets these as:
 *   start = startOfDay(startDate, userTimezone)
 *   end   = endOfDay(endDate,   userTimezone)
 * so the full end day is always included.
 */
export function buildCustomDateRange(
  startDate: Date,
  endDate: Date
): CustomDateRange {
  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  };
}

/**
 * Format a YYYY-MM-DD string for display (MM-DD-YYYY).
 * Avoids Date parsing to prevent the same UTC-shift issue.
 */
export function formatDateForDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${month}-${day}-${year}`;
}
