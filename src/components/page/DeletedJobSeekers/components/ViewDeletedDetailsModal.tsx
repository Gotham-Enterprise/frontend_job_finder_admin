import React, { useState } from 'react';
import { EyeIcon, CloseIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon } from '@/icons';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import LoadingSkeleton from '../../../ui/LoadingSkeleton';
import { ViewDeletedDetailsModalProps } from '@/services/types/deletedJobSeekers';

const ViewDeletedDetailsModal: React.FC<ViewDeletedDetailsModalProps> = ({
  isOpen,
  onClose,
  deletedAccount,
  onRestore,
  isLoading,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (expandedSections.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const DetailSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }> = ({ id, title, children, defaultExpanded = false }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg"
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        )}
      </div>
    );
  };

  const InfoRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({
    label,
    value,
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {value || 'Not specified'}
      </span>
    </div>
  );

  if (!deletedAccount) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl mx-auto">
      <div className="max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deleted Account Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete information for deleted job seeker account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!deletedAccount.isRestored && onRestore && (
              <Button
                variant="outline"
                onClick={() => onRestore(deletedAccount)}
                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
              >
                <ArrowUpIcon className="w-4 h-4 mr-2" />
                Restore Account
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Account Status
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current state of the deleted account
                    </p>
                  </div>
                  <div className="text-right">
                    {deletedAccount.isRestored ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Restored
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Deleted
                      </span>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {deletedAccount.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <DetailSection id="basic" title="Basic Information" defaultExpanded>
                <div className="space-y-0 mt-3">
                  <InfoRow label="Full Name" value={`${deletedAccount.originalFirstName} ${deletedAccount.originalLastName}`} />
                  <InfoRow label="Email" value={deletedAccount.originalEmail} />
                  <InfoRow label="Username" value={deletedAccount.originalUsername} />
                  <InfoRow label="Role" value={deletedAccount.originalRole} />
                  <InfoRow label="Status at Deletion" value={deletedAccount.originalStatus} />
                  <InfoRow label="Account Created" value={formatDate(deletedAccount.originalCreatedAt)} />
                  <InfoRow label="Last Updated" value={formatDate(deletedAccount.originalUpdatedAt)} />
                </div>
              </DetailSection>

              {/* Profile Information */}
              <DetailSection id="profile" title="Profile Information">
                <div className="space-y-0 mt-3">
                  <InfoRow label="Phone Number" value={deletedAccount.originalPhoneNumber} />
                  <InfoRow label="Birthday" value={deletedAccount.originalBirthday} />
                  <InfoRow label="Address" value={deletedAccount.originalAddress} />
                  <InfoRow label="City" value={deletedAccount.originalCity} />
                  <InfoRow label="State" value={deletedAccount.originalState} />
                  <InfoRow label="Country" value={deletedAccount.originalCountry} />
                  <InfoRow label="Zip Code" value={deletedAccount.originalZipCode} />
                </div>
              </DetailSection>

              {/* Professional Information */}
              <DetailSection id="professional" title="Professional Information">
                <div className="space-y-0 mt-3">
                  <InfoRow label="Occupation ID" value={deletedAccount.originalOccupationId} />
                  <InfoRow label="Specialty ID" value={deletedAccount.originalSpecialtyId} />
                  <InfoRow label="Experience (Months)" value={deletedAccount.originalMonthsOfExperience} />
                  <InfoRow label="Availability to Start" value={deletedAccount.originalAvailabilityToStart} />
                  <InfoRow label="Open for Statewide Jobs" value={deletedAccount.originalOpenForStateWideJobs ? 'Yes' : 'No'} />
                  <InfoRow label="Willing to Relocate" value={deletedAccount.originalWillingToRelocate ? 'Yes' : 'No'} />
                  <InfoRow label="Desired Salary" value={deletedAccount.originalDesiredSalary ? `$${deletedAccount.originalDesiredSalary.toLocaleString()}` : undefined} />
                  <InfoRow label="Degree" value={deletedAccount.originalDegree} />
                  {deletedAccount.originalPersonalSummary && (
                    <div className="py-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Personal Summary:</span>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {deletedAccount.originalPersonalSummary}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Deletion Information */}
              <DetailSection id="deletion" title="Deletion Information">
                <div className="space-y-0 mt-3">
                  <InfoRow label="Deleted By" value={`${deletedAccount.deletedByAdmin.firstName} ${deletedAccount.deletedByAdmin.lastName}`} />
                  <InfoRow label="Admin Email" value={deletedAccount.deletedByAdmin.email} />
                  <InfoRow label="Deleted At" value={formatDate(deletedAccount.deletedAt)} />
                  <InfoRow label="Masked Email" value={deletedAccount.maskedEmail} />
                  <InfoRow label="Masked Username" value={deletedAccount.maskedUsername} />
                  <InfoRow label="Total Applications" value={deletedAccount.totalApplicationsCount} />
                  {deletedAccount.deletionReason && (
                    <InfoRow label="Deletion Reason" value={deletedAccount.deletionReason} />
                  )}
                  {deletedAccount.notes && (
                    <div className="py-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Notes:</span>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {deletedAccount.notes}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Restoration Information */}
              {deletedAccount.isRestored && (
                <DetailSection id="restoration" title="Restoration Information">
                  <div className="space-y-0 mt-3">
                    <InfoRow label="Restored" value="Yes" />
                    {deletedAccount.restoredByAdmin && (
                      <>
                        <InfoRow label="Restored By" value={`${deletedAccount.restoredByAdmin.firstName} ${deletedAccount.restoredByAdmin.lastName}`} />
                        <InfoRow label="Restored By Email" value={deletedAccount.restoredByAdmin.email} />
                      </>
                    )}
                    {deletedAccount.restoredAt && (
                      <InfoRow label="Restored At" value={formatDate(deletedAccount.restoredAt)} />
                    )}
                  </div>
                </DetailSection>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewDeletedDetailsModal;
