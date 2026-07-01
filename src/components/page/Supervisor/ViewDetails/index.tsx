"use client";
import React, { useMemo, useState } from "react";
import { Check, Mail, Pencil } from "lucide-react";
import {
  useSupervisorDetails,
  useApproveSupervisor,
  useRejectSupervisor,
  useResendSupervisorVerification,
  useEditSupervisorVerificationNotes,
  useSupervisionProfileDisplayOptions,
} from "@/services/hooks/useSupervisors";
import { formatDate, formatDateTime } from "@/services/utils/dateUtils";
import { formatStateOfLicensureForDisplay } from "@/services/utils/formatUsStateLicensure";
import {
  formatSingleSupervisionOptionDisplay,
  formatSupervisionCodeListForDisplay,
} from "@/services/utils/formatSupervisionCertifications";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import BackToListButton from "@/components/ui/BackToListButton";
import Badge from "@/components/ui/badge/Badge";
import EmailVerifiedBadge from "@/components/ui/badge/EmailVerifiedBadge";
import Avatar from "@/components/ui/avatar/Avatar";
import { ApproveSupervisorModal, RejectSupervisorModal, SupervisorStatusBadge, EditVerificationNotesModal, EditSupervisorModal, ResendVerificationModal } from "../components";
import { VerificationStatus } from "@/services/types/supervisor";
import { getSupervisorCredentialTypeLabel, isSupervisorTypeWithoutCertifications } from "@/constants/supervisorSignupOptions";
import { CloseLineIcon } from "@/icons";

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
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
        {titleAction ? <div className="flex shrink-0 items-center">{titleAction}</div> : null}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white flex-1">{value || <span className="text-gray-400 italic">Not specified</span>}</span>
    </div>
  );
}

export default function ViewDetails({ id }: ViewDetailsProps) {
  const { data, isLoading, error, refetch } = useSupervisorDetails(id);
  const {
    certificateOptions,
    formatOptions,
    availabilityOptions,
    patientPopulationOptions,
  } = useSupervisionProfileDisplayOptions();

  const certificationDisplay = useMemo(
    () =>
      formatSupervisionCodeListForDisplay(
        data?.success ? data.data.supervisorProfile?.certification : undefined,
        certificateOptions
      ),
    [data?.success, data?.data?.supervisorProfile?.certification, certificateOptions]
  );

  const supervisionFormatDisplay = useMemo(
    () =>
      formatSingleSupervisionOptionDisplay(
        data?.success ? data.data.supervisorProfile?.supervisionFormat : undefined,
        formatOptions
      ),
    [data?.success, data?.data?.supervisorProfile?.supervisionFormat, formatOptions]
  );

  const availabilityDisplay = useMemo(
    () =>
      formatSingleSupervisionOptionDisplay(
        data?.success ? data.data.supervisorProfile?.availability : undefined,
        availabilityOptions
      ),
    [data?.success, data?.data?.supervisorProfile?.availability, availabilityOptions]
  );

  const patientPopulationDisplay = useMemo(
    () =>
      formatSupervisionCodeListForDisplay(
        data?.success ? data.data.supervisorProfile?.patientPopulation : undefined,
        patientPopulationOptions
      ),
    [data?.success, data?.data?.supervisorProfile?.patientPopulation, patientPopulationOptions]
  );

  const verifiedByDisplay = useMemo(() => {
    if (!data?.success || !data.data) return null;
    const admin = data.data.verifiedByAdmin;
    const id = data.data.supervisorProfile?.verifiedByAdminId;
    if (admin) {
      const name = admin.fullName?.trim();
      if (name && admin.email) return `${name} (${admin.email})`;
      if (name) return name;
      if (admin.email) return admin.email;
    }
    return id || null;
  }, [data]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [editNotesModalOpen, setEditNotesModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [editNotesDraft, setEditNotesDraft] = useState("");

  const { mutate: approveMutate, isPending: isApproving } = useApproveSupervisor();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectSupervisor();
  const { mutate: editNotesMutate, isPending: isSavingNotes } = useEditSupervisorVerificationNotes();
  const { mutate: resendMutate, isPending: isResending } = useResendSupervisorVerification();

  const handleApprove = () => {
    const trimmed = approveNotes.trim();
    approveMutate(
      { id, verificationNotes: trimmed ? trimmed : undefined },
      {
        onSuccess: () => {
          setApproveModalOpen(false);
          setApproveNotes("");
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) return;
    rejectMutate(
      { id, verificationNotes: rejectNotes.trim() },
      { onSuccess: () => { setRejectModalOpen(false); setRejectNotes(""); } }
    );
  };

  const handleSaveEditNotes = () => {
    const trimmed = editNotesDraft.trim();
    if (!trimmed) return;
    editNotesMutate(
      { id, verificationNotes: trimmed },
      {
        onSuccess: () => {
          setEditNotesModalOpen(false);
          setEditNotesDraft("");
        },
      }
    );
  };

  const handleResendVerification = () => {
    resendMutate(id, { onSuccess: () => setResendModalOpen(false) });
  };

  const verificationBusy = isApproving || isRejecting || isSavingNotes;

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading supervisor details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervisors" className="mb-6" preserveState={true}>
          Back to Supervisors
        </BackToListButton>
        <ErrorState message={`Error loading supervisor details: ${error.message}`} />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervisors" className="mb-6" preserveState={true}>
          Back to Supervisors
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Supervisor not found</p>
        </div>
      </div>
    );
  }

  const s = data.data;
  const profile = s.supervisorProfile;
  const verificationStatus: VerificationStatus = profile?.verificationStatus || "PENDING";

  const displayName = s.fullName || [s.firstName, s.lastName].filter(Boolean).join(" ") || s.userName;
  const location = [s.city, s.state, s.zipcode].filter(Boolean).join(", ");

  /** Among ACTIVE subscriptions, show only the most recently created (e.g. upgraded plan vs stale free tier). */
  const latestActiveSubscription = (() => {
    const active = (s.subscriptions ?? []).filter((sub) => sub.status === "ACTIVE");
    if (active.length === 0) return null;
    return active.reduce((latest, sub) => {
      const t = new Date(sub.createdAt).getTime();
      const best = new Date(latest.createdAt).getTime();
      return t >= best ? sub : latest;
    });
  })();

  const hideSubscriptionPeriodAndStatus =
    (latestActiveSubscription?.plan?.name ?? "").toLowerCase().includes("free plan");

  /** User `stateOfLicensure` is canonical; profile `stateLicense` is merged if not already listed. */
  const statesOfLicensureDisplay = (() => {
    const codes: string[] = [];
    const seen = new Set<string>();
    const push = (raw: string | null | undefined) => {
      const v = raw?.trim();
      if (!v) return;
      const key = v.toUpperCase();
      if (seen.has(key)) return;
      seen.add(key);
      codes.push(v);
    };
    for (const c of s.stateOfLicensure ?? []) push(c);
    push(profile?.stateLicense ?? null);
    return codes.length ? codes.map(formatStateOfLicensureForDisplay).join(", ") : null;
  })();

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <BackToListButton href="/admin/supervisors" preserveState={true}>
            Back to Supervisors
          </BackToListButton>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4 shrink-0" aria-hidden />
              Edit supervisor
            </button>

            {!s.emailVerified && (
              <button
                type="button"
                onClick={() => setResendModalOpen(true)}
                disabled={isResending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-warning-700 bg-warning-50 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:hover:bg-warning-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                Resend verification
              </button>
            )}

            {verificationStatus !== "APPROVED" && (
              <button
                onClick={() => { setApproveNotes(""); setApproveModalOpen(true); }}
                disabled={verificationBusy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-success-700 bg-success-50 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                Approve
              </button>
            )}

            {verificationStatus !== "REJECTED" && (
              <button
                onClick={() => { setRejectNotes(""); setRejectModalOpen(true); }}
                disabled={verificationBusy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-700 bg-error-50 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloseLineIcon className="w-4 h-4" />
                Reject
              </button>
            )}
          </div>
        </div>

        {/* Top identity card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start">
          <Avatar
            src={s.profilePhotoUrl || undefined}
            name={displayName || "?"}
            size="xlarge"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{displayName || "—"}</h2>
              <SupervisorStatusBadge status={verificationStatus} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{s.email}</p>
            {(profile?.supervisorType || s.supervisorOccupation) && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {[profile?.supervisorType, s.supervisorOccupation, s.supervisorSpecialty]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {location && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location}</p>}
          </div>
        </div>

        <div className="space-y-5">
          {/* Basic Info */}
          <SectionCard title="Basic Info">
            <FieldRow label="Full Name" value={displayName} />
            <FieldRow label="Email" value={s.email} />
            <FieldRow label="Phone" value={s.contactNumber} />
            <FieldRow label="Username" value={s.userName} />
            <FieldRow label="City" value={s.city} />
            <FieldRow label="State" value={formatStateOfLicensureForDisplay(s.state)} />
            <FieldRow label="Zip Code" value={s.zipcode} />
            <FieldRow
              label="Email Verified"
              value={<EmailVerifiedBadge verified={s.emailVerified} />}
            />
            <FieldRow
              label="Email Verified At"
              value={s.emailVerified ? formatDateTime(s.emailVerifiedAt, "Not specified") : null}
            />
            <FieldRow label="Account Status" value={s.status} />
            <FieldRow label="Registered" value={formatDateTime(s.createdAt, "Not specified")} />
          </SectionCard>

          {/* Professional Info */}
          <SectionCard title="Professional Info">
            <FieldRow label="Supervisor Type" value={profile?.supervisorType} />
            <FieldRow label="Occupation" value={s.supervisorOccupation} />
            <FieldRow label="Specialty" value={s.supervisorSpecialty} />
            <FieldRow label="Years of Experience" value={profile?.yearsOfExperience ? `${profile.yearsOfExperience} years` : null} />
            <FieldRow
              label="Professional Summary"
              value={
                profile?.professionalSummary ? (
                  <span className="whitespace-pre-line">{profile.professionalSummary}</span>
                ) : null
              }
            />
            <FieldRow
              label="About"
              value={profile?.describeYourself ? <span className="whitespace-pre-line">{profile.describeYourself}</span> : null}
            />
            <FieldRow label="Website" value={profile?.website ? (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline break-all">
                {profile.website}
              </a>
            ) : null} />
          </SectionCard>

          {/* License / Credentials */}
          <SectionCard title="License & Credentials">
            <FieldRow
              label={getSupervisorCredentialTypeLabel(profile?.supervisorType ?? "")}
              value={
                isSupervisorTypeWithoutCertifications(profile?.supervisorType ?? "")
                  ? profile?.degreeType
                  : profile?.licenseType
              }
            />
            <FieldRow label="License Number" value={profile?.licenseNumber} />
            <FieldRow label="States of Licensure" value={statesOfLicensureDisplay} />
            <FieldRow label="License Expiration Date" value={formatDate(profile?.licenseExpiration)} />
            <FieldRow label="NPI Number" value={profile?.npiNumber} />
            <FieldRow label="Certifications" value={certificationDisplay} />
            <FieldRow label="License Document" value={profile?.licenseUrl ? (
              <a href={profile.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                {profile.licenseFileName || "View Document"}
              </a>
            ) : null} />
            {profile?.verificationDocumentUrl && (
              <FieldRow label="Verification Doc" value={
                <a href={profile.verificationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                  View Verification Document
                </a>
              } />
            )}
          </SectionCard>

          {/* Supervision Preferences */}
          <SectionCard title="Supervision Preferences">
            <FieldRow label="Supervision Format" value={supervisionFormatDisplay} />
            <FieldRow label="Availability" value={availabilityDisplay} />
            <FieldRow label="Accepting Supervisees" value={profile?.acceptingSupervisees ? "Yes" : "No"} />
            <FieldRow label="Patient Population" value={patientPopulationDisplay} />
            <FieldRow
              label="Supervision Fee"
              value={
                profile?.supervisionFeeType && profile?.supervisionFeeAmount != null
                  ? `${new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(profile.supervisionFeeAmount)} / ${profile.supervisionFeeType}`
                  : null
              }
            />
          </SectionCard>

          {/* Verification */}
          <SectionCard
            title="Verification"
            titleAction={
              profile ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditNotesDraft(profile.verificationNotes ?? "");
                    setEditNotesModalOpen(true);
                  }}
                  disabled={verificationBusy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                  Edit verification notes
                </button>
              ) : null
            }
          >
            <FieldRow
              label="Status"
              value={
                <SupervisorStatusBadge status={verificationStatus} />
              }
            />
            <FieldRow label="Verified At" value={formatDate(profile?.verifiedAt)} />
            <FieldRow label="Verified By" value={verifiedByDisplay} />
            <FieldRow
              label="Verification Notes"
              value={profile?.verificationNotes ? (
                <span className="whitespace-pre-line">{profile.verificationNotes}</span>
              ) : null}
            />
            {profile?.verificationNotes?.trim() ? (
              <FieldRow label="Verification Notes At" value={formatDate(profile?.verificationNotesAt)} />
            ) : null}
          </SectionCard>

          {/* Subscription — latest ACTIVE row only */}
          {latestActiveSubscription && (
            <SectionCard title="Subscription">
              <div>
                <FieldRow label="Plan" value={latestActiveSubscription.plan?.name} />
                {!hideSubscriptionPeriodAndStatus && (
                  <>
                    <FieldRow
                      label="Status"
                      value={
                        <Badge variant="solid" color="success" size="sm">
                          {latestActiveSubscription.status}
                        </Badge>
                      }
                    />
                    <FieldRow label="Period Start" value={formatDate(latestActiveSubscription.currentPeriodStart)} />
                    <FieldRow label="Period End" value={formatDate(latestActiveSubscription.currentPeriodEnd)} />
                  </>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <ApproveSupervisorModal
        isOpen={approveModalOpen}
        fullName={displayName || s.email}
        note={approveNotes}
        onNoteChange={setApproveNotes}
        onConfirm={handleApprove}
        onCancel={() => { setApproveModalOpen(false); setApproveNotes(""); }}
        isLoading={isApproving}
      />

      <RejectSupervisorModal
        isOpen={rejectModalOpen}
        fullName={displayName || s.email}
        notes={rejectNotes}
        onNotesChange={setRejectNotes}
        onConfirm={handleReject}
        onCancel={() => { setRejectModalOpen(false); setRejectNotes(""); }}
        isLoading={isRejecting}
      />

      <EditVerificationNotesModal
        isOpen={editNotesModalOpen}
        fullName={displayName || s.email}
        notes={editNotesDraft}
        onNotesChange={setEditNotesDraft}
        onConfirm={handleSaveEditNotes}
        onCancel={() => { setEditNotesModalOpen(false); setEditNotesDraft(""); }}
        isLoading={isSavingNotes}
      />

      <EditSupervisorModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        supervisorId={id}
        supervisorName={displayName || s.email}
        onUpdate={() => refetch()}
      />

      <ResendVerificationModal
        isOpen={resendModalOpen}
        fullName={displayName || s.email}
        onConfirm={handleResendVerification}
        onCancel={() => setResendModalOpen(false)}
        isLoading={isResending}
      />
    </>
  );
}
