import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import type { EngagementCounterpart, EngagementHireKind } from "@/services/types/supervisionEngagement";

/** Pieces shared by the Engagement card and the engagement dashboard. */

export type BadgeColor = React.ComponentProps<typeof Badge>["color"];

export const HIRE_STATUS_COLORS: Record<string, BadgeColor> = {
  ACTIVE: "success",
  ACCEPTED: "success",
  PENDING: "warning",
  REVIEWED: "warning",
  COMPLETED: "info",
  DISPUTED: "error",
  REJECTED: "light",
  CANCELED: "light",
  REFUNDED: "light",
};

export const HIRE_KIND_LABELS: Record<EngagementHireKind, string> = {
  SUPERVISION: "Supervision",
  MEDICAL_DIRECTOR: "Medical Director",
};

export function humanizeStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

export function HireStatusBadge({ status }: { status: string }) {
  return (
    <Badge size="sm" color={HIRE_STATUS_COLORS[status] ?? "light"}>
      {humanizeStatus(status)}
    </Badge>
  );
}

function counterpartHref(counterpart: EngagementCounterpart): string | null {
  if (counterpart.isDeleted) return null;
  if (counterpart.role === "SUPERVISEE") return `/admin/supervisees/details/${counterpart.id}`;
  if (counterpart.role === "SUPERVISOR") return `/admin/supervisors/details/${counterpart.id}`;
  return null;
}

export function CounterpartCell({ counterpart }: { counterpart: EngagementCounterpart | null }) {
  if (!counterpart) return <span className="text-gray-400 italic">Unknown user</span>;
  const href = counterpartHref(counterpart);
  const name = counterpart.name || counterpart.email;
  return (
    <div className="min-w-0">
      {href ? (
        <Link href={href} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          {name}
        </Link>
      ) : (
        <span className="font-medium text-gray-900 dark:text-white">{name}</span>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {counterpart.roleLabel}
        {counterpart.isDeleted ? " · Deleted account" : ""}
      </div>
    </div>
  );
}

export const TH = "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap";
export const TD = "px-3 py-2 align-top text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";

export function SubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{children}</h4>;
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 italic">{children}</p>;
}
