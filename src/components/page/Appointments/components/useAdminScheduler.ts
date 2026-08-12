"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { appointmentApi } from "@/services/api/appointment";
import { AvailableSlot } from "@/services/types/appointment";

// Mirrors the public site's useAppointmentScheduler: candidate business days are
// generated client-side (the backend has no "available dates" endpoint) and
// per-date availability comes from the shared available-slots endpoint.
const BOOKING_WINDOW_DAYS = 21;

export const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const startOfWeek = (date: Date): Date => addDays(date, -date.getDay());

// Today's date in the backend's timezone (slots are offered in Eastern Time)
export const easternTodayKey = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

const isSameWeekAs = (dateKey: string, weekStart: Date): boolean =>
  startOfWeek(parseDateKey(dateKey)).getTime() === weekStart.getTime();

const generateBusinessDays = (): string[] => {
  const dates: string[] = [];
  const today = parseDateKey(easternTodayKey());

  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const day = addDays(today, i);
    if (day.getDay() !== 0 && day.getDay() !== 6) {
      dates.push(toDateKey(day));
    }
  }

  return dates;
};

export function useAdminScheduler() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  // date -> whether it still has open slots; undefined until its week is prefetched
  const [dateAvailability, setDateAvailability] = useState<Record<string, boolean>>({});
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(parseDateKey(easternTodayKey())));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const prefetchedDatesRef = useRef<Set<string>>(new Set());
  // Date of the most recent slots request; older responses arriving late are ignored
  const latestSlotsRequestRef = useRef<string | null>(null);

  const prefetchDates = useCallback(async (dates: string[]) => {
    const results = await Promise.allSettled(dates.map((date) => appointmentApi.getAvailableSlots(date)));
    const availability: Record<string, boolean> = {};

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        availability[dates[index]] = result.value.data.slots.some((slot) => slot.available);
      }
    });

    setDateAvailability((prev) => ({ ...prev, ...availability }));
    return availability;
  }, []);

  const loadTimeSlots = useCallback(async (date: string) => {
    latestSlotsRequestRef.current = date;
    setIsLoadingSlots(true);
    setSelectedSlot(null);

    try {
      const response = await appointmentApi.getAvailableSlots(date);
      const openSlots = response.data.slots.filter((slot) => slot.available);
      setDateAvailability((prev) => ({ ...prev, [date]: openSlots.length > 0 }));
      if (latestSlotsRequestRef.current !== date) return;
      setTimeSlots(openSlots);
    } catch {
      if (latestSlotsRequestRef.current !== date) return;
      setTimeSlots([]);
    } finally {
      if (latestSlotsRequestRef.current === date) {
        setIsLoadingSlots(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    const dates = generateBusinessDays();
    prefetchedDatesRef.current = new Set();
    latestSlotsRequestRef.current = null;
    setAvailableDates(dates);
    setDateAvailability({});
    setTimeSlots([]);
    setSelectedSlot(null);
    setSelectedDate(null);

    const firstDate = dates[0];
    if (!firstDate) return;

    const firstWeekStart = startOfWeek(parseDateKey(firstDate));
    setWeekStart(firstWeekStart);

    // Prefetch the first week, then land on the first day that has open slots
    const firstWeekDates = dates.filter((date) => isSameWeekAs(date, firstWeekStart));
    firstWeekDates.forEach((date) => prefetchedDatesRef.current.add(date));
    setIsLoadingSlots(true);
    prefetchDates(firstWeekDates).then((availability) => {
      const firstOpenDate = firstWeekDates.find((date) => availability[date]) ?? firstDate;
      setSelectedDate(firstOpenDate);
      loadTimeSlots(firstOpenDate);
    });
  }, [prefetchDates, loadTimeSlots]);

  // Prefetch availability for the visible week so fully-booked days can be
  // greyed out before the admin clicks them
  useEffect(() => {
    const datesToPrefetch = availableDates.filter(
      (date) => isSameWeekAs(date, weekStart) && !prefetchedDatesRef.current.has(date)
    );
    if (datesToPrefetch.length === 0) return;
    datesToPrefetch.forEach((date) => prefetchedDatesRef.current.add(date));
    prefetchDates(datesToPrefetch);
  }, [weekStart, availableDates, prefetchDates]);

  const selectDate = useCallback(
    (date: string) => {
      setSelectedDate(date);
      // Always re-fetch so availability is revalidated on every selection
      loadTimeSlots(date);
    },
    [loadTimeSlots]
  );

  return {
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
    reset,
  };
}

export type AdminScheduler = ReturnType<typeof useAdminScheduler>;
