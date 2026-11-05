import type { EngagementOverviewPeriod } from "@/services/types/supervisionEngagement";

/** Change against the previous period, already phrased for a stat tile. */
export interface Delta {
  /** e.g. "▲ 18%", "▼ 5 pts", "▲ 2h slower". Arrow + words, never color alone. */
  text: string;
  /** Whether the change is good news; drives the color. */
  tone: "good" | "bad" | "neutral";
}

export const PREVIOUS_PERIOD_LABELS: Record<EngagementOverviewPeriod, string> = {
  "7d": "previous 7 days",
  "28d": "previous 28 days",
  "3m": "previous 3 months",
  "6m": "previous 6 months",
  "1y": "previous year",
};

/** 45 → "45m", 320 → "5h 20m", 1620 → "1d 3h". */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}m`;
  if (total < 24 * 60) {
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  const days = Math.floor(total / (24 * 60));
  const hours = Math.round((total % (24 * 60)) / 60);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}

export function formatPercent(rate: number | null | undefined): string {
  return rate === null || rate === undefined ? "—" : `${Math.round(rate * 100)}%`;
}

const arrow = (change: number) => (change > 0 ? "▲" : "▼");

/** Counts where more is better (messages, hires, requests). */
export function compareCount(current: number, previous: number): Delta | null {
  if (current === previous) return current === 0 ? null : { text: "No change", tone: "neutral" };
  if (previous === 0) return { text: `▲ up from 0`, tone: "good" };
  const change = (current - previous) / previous;
  return {
    text: `${arrow(change)} ${Math.abs(Math.round(change * 100))}%`,
    tone: change > 0 ? "good" : "bad",
  };
}

/** Rates (0–1) where higher is better, compared in percentage points. */
export function compareRate(current: number | null, previous: number | null): Delta | null {
  if (current === null || previous === null) return null;
  const points = Math.round((current - previous) * 100);
  if (points === 0) return { text: "No change", tone: "neutral" };
  return { text: `${arrow(points)} ${Math.abs(points)} pts`, tone: points > 0 ? "good" : "bad" };
}

/** Durations where lower is better (reply and answer times). */
export function compareDuration(current: number | null, previous: number | null): Delta | null {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 1) return { text: "No change", tone: "neutral" };
  return {
    text: `${arrow(diff)} ${formatDuration(Math.abs(diff))} ${diff > 0 ? "slower" : "faster"}`,
    tone: diff > 0 ? "bad" : "good",
  };
}
