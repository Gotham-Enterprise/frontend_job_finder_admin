"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, UserCheck, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useAssignIngestLandlord, useIngestLandlords } from "@/services/hooks/useOfficeSpaceIngest";

interface AssignLandlordModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Empty when opened from a single-record action. */
  recordIds: string[];
  onAssigned?: () => void;
}

const AssignLandlordModal: React.FC<AssignLandlordModalProps> = ({
  isOpen,
  onClose,
  recordIds,
  onAssigned,
}) => {
  const [landlordId, setLandlordId] = useState<string>("");
  const { data, isLoading } = useIngestLandlords();
  const assign = useAssignIngestLandlord();

  // Reset each time the modal opens so a stale selection cannot be reused.
  useEffect(() => {
    if (isOpen) setLandlordId("");
  }, [isOpen]);

  const landlords = data?.data ?? [];
  const targetCount = recordIds.length;

  const selected = useMemo(
    () => landlords.find((l) => l.id === landlordId) ?? null,
    [landlords, landlordId]
  );

  const handleAssign = async () => {
    await assign.mutateAsync({ ids: recordIds, landlordId: landlordId || null });
    onAssigned?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} isFullscreen={false}>
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Assign landlord
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {targetCount === 1
                  ? "Link this record to a landlord profile."
                  : `Link ${targetCount} records to a landlord profile.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading landlords…</p>
        ) : landlords.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              No landlord profiles exist yet, so there is nothing to assign. Create a
              landlord profile first, then return here to link these records.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Landlord
            </label>
            <select
              value={landlordId}
              onChange={(e) => setLandlordId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Unassigned</option>
              {landlords.map((landlord) => (
                <option key={landlord.id} value={landlord.id}>
                  {landlord.businessName}
                  {landlord.user?.email ? ` — ${landlord.user.email}` : ""}
                </option>
              ))}
            </select>

            {selected?.businessEmail && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Contact: {selected.businessEmail}
                {selected.businessPhone ? ` · ${selected.businessPhone}` : ""}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={assign.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              assign.isPending || isLoading || landlords.length === 0 || targetCount === 0
            }
          >
            {assign.isPending ? "Assigning…" : "Save assignment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignLandlordModal;