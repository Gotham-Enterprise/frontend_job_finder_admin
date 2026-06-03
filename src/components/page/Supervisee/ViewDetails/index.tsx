"use client";

import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useSuperviseeDetails } from "@/services/hooks/useSupervisees";
import { formatDate } from "@/services/utils/dateUtils";
import { formatStateOfLicensureForDisplay, formatUsStateCodeForDisplay } from "@/services/utils/formatUsStateLicensure";
import { formatUSPhoneNationalDisplay } from "@/services/utils/phoneNumberUtils";
import {
  BUDGET_TYPE_LABELS,
  FORMAT_LABELS,
  HOW_SOON_LABELS,
} from "@/services/utils/superviseeProfileForm";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import BackToListButton from "@/components/ui/BackToListButton";
import Badge from "@/components/ui/badge/Badge";
import Avatar from "@/components/ui/avatar/Avatar";
import { EditSuperviseeModal } from "../components/EditSuperviseeModal";

interface ViewDetailsProps {
  id: string;
}

function SectionCard({
  title,
  children,
  titleAction,
}: {
  title: string;
  children: React.ReactNode;
  titleAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
        {titleAction ? <div className="flex shrink-0 items-center">{titleAction}</div> : null}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-44 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white flex-1">
        {value || <span className="text-gray-400 italic">Not specified</span>}
      </span>
    </div>
  );
}

export default function ViewDetails({ id }: ViewDetailsProps) {
  const { data, isLoading, error, refetch } = useSuperviseeDetails(id);
  const [editOpen, setEditOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!data?.success || !data.data) return "";
    const s = data.data;
    return s.fullName || [s.firstName, s.lastName].filter(Boolean).join(" ") || s.userName;
  }, [data]);

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading supervisee details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervisees" className="mb-6" preserveState={true}>
          Back to Supervisees
        </BackToListButton>
        <ErrorState message={`Error loading supervisee details: ${error.message}`} />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervisees" className="mb-6" preserveState={true}>
          Back to Supervisees
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Supervisee not found</p>
        </div>
      </div>
    );
  }

  const s = data.data;
  const profile = s.superviseeProfile;
  const location = [s.city, s.state, s.zipcode].filter(Boolean).join(", ");

  const statesOfLicensureDisplay =
    s.stateOfLicensure?.length > 0
      ? s.stateOfLicensure.map(formatStateOfLicensureForDisplay).join(", ")
      : null;

  const statesLookingDisplay =
    profile?.stateTheyAreLookingIn && profile.stateTheyAreLookingIn.length > 0
      ? profile.stateTheyAreLookingIn.map(formatStateOfLicensureForDisplay).join(", ")
      : null;

  const latestActiveSubscription = (() => {
    const active = (s.subscriptions ?? []).filter((sub) => sub.status === "ACTIVE");
    if (active.length === 0) return null;
    return active.reduce((latest, sub) => {
      const t = new Date(sub.createdAt).getTime();
      const best = new Date(latest.createdAt).getTime();
      return t >= best ? sub : latest;
    });
  })();

  const hideSubscriptionPeriod =
    (latestActiveSubscription?.plan?.name ?? "").toLowerCase().includes("free plan");

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <BackToListButton href="/admin/supervisees" preserveState={true}>
            Back to Supervisees
          </BackToListButton>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
            Edit supervisee
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start">
          <Avatar src={s.profilePhotoUrl || undefined} name={displayName || "?"} size="xlarge" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{displayName || "—"}</h2>
              <Badge variant="solid" color={s.emailVerified ? "success" : "warning"} size="sm">
                {s.emailVerified ? "Email verified" : "Email unverified"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{s.email}</p>
            {(profile?.superviseeOccupation || s.occupation?.name) && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {[profile?.superviseeOccupation || s.occupation?.name, profile?.superviseeSpecialty || s.specialty?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {location && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location}</p>}
          </div>
        </div>

        <div className="space-y-5">
          <SectionCard title="Basic Info">
            <FieldRow label="Full Name" value={displayName} />
            <FieldRow label="Email" value={s.email} />
            <FieldRow
              label="Phone"
              value={
                s.contactNumber ? formatUSPhoneNationalDisplay(s.contactNumber) : null
              }
            />
            <FieldRow label="Username" value={s.userName} />
            <FieldRow label="City" value={s.city} />
            <FieldRow label="State" value={formatUsStateCodeForDisplay(s.state)} />
            <FieldRow label="Zip Code" value={s.zipcode} />
            <FieldRow label="Account Status" value={s.status} />
            <FieldRow label="Active" value={s.isActive ? "Yes" : "No"} />
            <FieldRow label="Registered" value={formatDate(s.createdAt)} />
          </SectionCard>

          <SectionCard title="Occupation & Licensure">
            <FieldRow label="Occupation" value={s.occupation?.name} />
            <FieldRow label="Specialty" value={s.specialty?.name} />
            <FieldRow label="Credential / License Type" value={profile?.title} />
            <FieldRow label="States of Licensure" value={statesOfLicensureDisplay} />
          </SectionCard>

          <SectionCard title="Supervision Needs">
            <FieldRow
              label="Type of Supervision Needed"
              value={profile?.typeOfSupervisorNeeded?.join(", ")}
            />
            <FieldRow label="Occupation" value={profile?.superviseeOccupation} />
            <FieldRow label="Specialty" value={profile?.superviseeSpecialty} />
            <FieldRow
              label="How Soon"
              value={
                profile?.howSoonLooking
                  ? HOW_SOON_LABELS[profile.howSoonLooking] ?? profile.howSoonLooking
                  : null
              }
            />
            {profile?.howSoonLooking === "CUSTOM_DATE" && (
              <FieldRow label="Looking Date" value={formatDate(profile.lookingDate)} />
            )}
            <FieldRow
              label="Preferred Format"
              value={
                profile?.preferredFormat
                  ? FORMAT_LABELS[profile.preferredFormat] ?? profile.preferredFormat
                  : null
              }
            />
            <FieldRow label="Availability" value={profile?.availability} />
            <FieldRow label="States Looking In" value={statesLookingDisplay} />
            <FieldRow
              label="Budget"
              value={
                profile?.budgetRangeType
                  ? `${BUDGET_TYPE_LABELS[profile.budgetRangeType] ?? profile.budgetRangeType}${
                      profile.budgetRangeStart != null || profile.budgetRangeEnd != null
                        ? ` — $${profile.budgetRangeStart ?? 0}–$${profile.budgetRangeEnd ?? 0}`
                        : ""
                    }`
                  : null
              }
            />
            <FieldRow
              label="Ideal Supervisor"
              value={
                profile?.idealSupervisor ? (
                  <span className="whitespace-pre-line">{profile.idealSupervisor}</span>
                ) : null
              }
            />
          </SectionCard>

          {latestActiveSubscription && (
            <SectionCard title="Subscription">
              <FieldRow label="Plan" value={latestActiveSubscription.plan?.name} />
              {!hideSubscriptionPeriod && (
                <>
                  <FieldRow
                    label="Status"
                    value={
                      <Badge variant="solid" color="success" size="sm">
                        {latestActiveSubscription.status}
                      </Badge>
                    }
                  />
                  <FieldRow
                    label="Period Start"
                    value={formatDate(latestActiveSubscription.currentPeriodStart)}
                  />
                  <FieldRow
                    label="Period End"
                    value={formatDate(latestActiveSubscription.currentPeriodEnd)}
                  />
                </>
              )}
            </SectionCard>
          )}
        </div>
      </div>

      <EditSuperviseeModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        superviseeId={id}
        superviseeName={displayName || s.email}
        onUpdate={() => refetch()}
      />
    </>
  );
}
