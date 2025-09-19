import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDateTimeEST } from "@/services/utils/dateUtils";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Badge from "../../../ui/badge/Badge";
import Button from "../../../ui/button/Button";
import TableHeading from "../../../tables/tableHeader";
import {
  EyeIcon,
  TimeIcon,
  FileIcon,
  DownloadIcon,
  PencilIcon,
  PaperPlaneIcon,
  IdCardIcon,
  CheckCircleIcon,
} from "@/icons";
import { JobSeekersTableProps } from "@/services/types/JobSeekersTypes";
import Avatar from "../../../ui/avatar/Avatar";
import { EditJobSeekerModal } from "./EditJobSeekerModal";
import { ShareResumeModal } from "./ShareResumeModal";
import { useToast } from "@/context/ToastContext";
import PermissionWrapper from "@/components/common/PermissionWrapper";

interface SpecialtyDisplayProps {
  specialties: string[];
  jobSeekerId: string;
  expandedRows: Set<string>;
  onToggleExpanded: (jobSeekerId: string) => void;
}

const SpecialtyDisplay: React.FC<SpecialtyDisplayProps> = ({
  specialties,
  jobSeekerId,
  expandedRows,
  onToggleExpanded,
}) => {
  if (!specialties || specialties.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm italic">Not specified</span>;
  }

  const isExpanded = expandedRows.has(jobSeekerId);
  const shouldShowToggle = specialties.length > 2;
  const displayedSpecialties = isExpanded ? specialties : specialties.slice(0, 2);

  const toggleExpanded = () => {
    onToggleExpanded(jobSeekerId);
  };

  return (
    <div className="text-sm text-gray-900 dark:text-white">
      <div className="space-y-1">
        {displayedSpecialties.map((specialty, index) => (
          <div key={index} className="text-sm">
            {specialty}
          </div>
        ))}
      </div>
      {shouldShowToggle && (
        <Button
          variant="text-primary"
          size="sm"
          className="text-brand-400 mt-1 p-0 h-auto text-xs"
          onClick={toggleExpanded}
        >
          {isExpanded ? "See Less" : `See More (${specialties.length - 2} more)`}
        </Button>
      )}
    </div>
  );
};

interface LicensesPopoverProps {
  licenses: any[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const LicensesPopover: React.FC<LicensesPopoverProps> = ({ licenses, isOpen, onClose, triggerRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={popoverRef}
        className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md w-80 z-10"
        style={{
          top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 5 : 0,
          left: triggerRef.current ? Math.max(10, triggerRef.current.getBoundingClientRect().left - 150) : 0,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Licenses</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1 transition-colors duration-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {licenses.map((license: any, index: number) => (
            <div key={license.id || index} className="py-3 border-b transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <IdCardIcon className="w-4 h-4 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-primary mb-2">{license.name}</div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>License Number:</span>
                    {license.licenseIdNumber && <span className="flex flex-col">#{license.licenseIdNumber}</span>}
                  </div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>Issuing State:</span>
                    {license.issuingState && <span className="flex flex-col">{license.issuingState}</span>}
                  </div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>Issue Date:</span>
                    {license.issueDate && (
                      <div className="flex flex-col">Issued: {new Date(license.issueDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CertificationsPopoverProps {
  certifications: any[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const CertificationsPopover: React.FC<CertificationsPopoverProps> = ({
  certifications,
  isOpen,
  onClose,
  triggerRef,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={popoverRef}
        className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md w-80 z-10"
        style={{
          top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 5 : 0,
          left: triggerRef.current ? Math.max(10, triggerRef.current.getBoundingClientRect().left - 150) : 0,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Certifications</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1 transition-colors duration-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {certifications.map((certification: any, index: number) => (
            <div key={certification.id || index} className="py-3 border-b transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircleIcon className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-emerald-900 dark:text-emerald-100 mb-2">
                    {certification.name}
                  </div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>Issuer:</span>
                    {certification.issuer && <span className="flex flex-col">{certification.issuer}</span>}
                  </div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>Issue Date:</span>
                    {certification.issueDate && (
                      <div className="flex flex-col">
                        Issued: {new Date(certification.issueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between gap-2 mb-2 flex-wrap">
                    <span>Expiration Date:</span>
                    {certification.expirationDate && (
                      <div className="flex flex-col">
                        Expires: {new Date(certification.expirationDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const JobSeekersTable: React.FC<JobSeekersTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewJobSeeker,
  onViewResume,
  isViewingResume,
  onRefresh,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJobSeekerId, setSelectedJobSeekerId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedJobSeekerForShare, setSelectedJobSeekerForShare] = useState<any>(null);
  const [licensesPopover, setLicensesPopover] = useState<{ isOpen: boolean; jobSeekerId: string | null }>({
    isOpen: false,
    jobSeekerId: null,
  });
  const [certificationsPopover, setCertificationsPopover] = useState<{ isOpen: boolean; jobSeekerId: string | null }>({
    isOpen: false,
    jobSeekerId: null,
  });
  const [loadingLicensesId, setLoadingLicensesId] = useState<string | null>(null);
  const [loadingCertificationsId, setLoadingCertificationsId] = useState<string | null>(null);
  const licensesButtonRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({});
  const certificationsButtonRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({});
  const { addToast } = useToast();

  // Helper functions for popovers
  const openLicensesPopover = async (jobSeekerId: string) => {
    setLoadingLicensesId(jobSeekerId);

    // Simulate a brief delay to show loading state (you can replace this with actual API call if needed)
    await new Promise((resolve) => setTimeout(resolve, 300));

    setLicensesPopover({ isOpen: true, jobSeekerId });
    setLoadingLicensesId(null);
  };

  const closeLicensesPopover = () => {
    setLicensesPopover({ isOpen: false, jobSeekerId: null });
    setLoadingLicensesId(null);
  };

  const openCertificationsPopover = async (jobSeekerId: string) => {
    setLoadingCertificationsId(jobSeekerId);

    // Simulate a brief delay to show loading state (you can replace this with actual API call if needed)
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCertificationsPopover({ isOpen: true, jobSeekerId });
    setLoadingCertificationsId(null);
  };

  const closeCertificationsPopover = () => {
    setCertificationsPopover({ isOpen: false, jobSeekerId: null });
    setLoadingCertificationsId(null);
  };

  // Ensure refs exist for each job seeker
  const getLicensesButtonRef = (jobSeekerId: string) => {
    if (!licensesButtonRefs.current[jobSeekerId]) {
      licensesButtonRefs.current[jobSeekerId] = React.createRef<HTMLButtonElement>();
    }
    return licensesButtonRefs.current[jobSeekerId];
  };

  const getCertificationsButtonRef = (jobSeekerId: string) => {
    if (!certificationsButtonRefs.current[jobSeekerId]) {
      certificationsButtonRefs.current[jobSeekerId] = React.createRef<HTMLButtonElement>();
    }
    return certificationsButtonRefs.current[jobSeekerId];
  };

  const openEditModal = (jobSeekerId: string) => {
    setSelectedJobSeekerId(jobSeekerId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedJobSeekerId(null);
  };

  const openShareModal = (jobSeeker: any) => {
    setSelectedJobSeekerForShare(jobSeeker);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setSelectedJobSeekerForShare(null);
  };

  const hasResume = (jobSeeker: any) => {
    return (
      (jobSeeker.hasResume && jobSeeker.resumeFileObjectKey) ||
      (jobSeeker.resumeId && jobSeeker.resumeFileObjectKey) ||
      (jobSeeker.documents && jobSeeker.documents.length > 0 && jobSeeker.documents.some((doc: any) => doc.objectKey))
    );
  };

  const getResumeData = (jobSeeker: any) => {
    if (jobSeeker.hasResume && jobSeeker.resumeFileObjectKey) {
      return {
        id: jobSeeker.resumeId, // Include the resume ID
        objectKey: jobSeeker.resumeFileObjectKey,
        fileName: jobSeeker.resumeFileName,
      };
    }

    if (jobSeeker.resumeId && jobSeeker.resumeFileObjectKey) {
      return {
        id: jobSeeker.resumeId, // Include the resume ID
        objectKey: jobSeeker.resumeFileObjectKey,
        fileName: jobSeeker.resumeFileName,
      };
    }

    if (jobSeeker.documents && jobSeeker.documents.length > 0) {
      const resumeDoc =
        jobSeeker.documents.find(
          (doc: any) => doc.type?.toLowerCase().includes("resume") || doc.fileName?.toLowerCase().includes("resume")
        ) || jobSeeker.documents[0];

      if (resumeDoc && resumeDoc.objectKey) {
        return {
          id: resumeDoc.id, // Include the document ID
          objectKey: resumeDoc.objectKey,
          fileName: resumeDoc.fileName,
        };
      }
    }

    return null;
  };
  const refreshData = (showSuccessToast = false) => {
    if (showSuccessToast) {
      addToast({
        variant: "success",
        title: "Success",
        message: "Job seeker has been updated successfully",
        duration: 5000,
      });
    }

    if (onRefresh) {
      onRefresh();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const toggleExpanded = (jobSeekerId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(jobSeekerId)) {
      newExpandedRows.delete(jobSeekerId);
    } else {
      newExpandedRows.add(jobSeekerId);
    }
    setExpandedRows(newExpandedRows);
  };

  const viewResume = async (jobSeekerId: string, objectKey: string, fileName?: string) => {
    setLoadingResumeId(jobSeekerId);
    try {
      await onViewResume(objectKey, fileName);
    } finally {
      setLoadingResumeId(null);
    }
  };

  const renderResumeButton = (jobSeeker: any) => {
    const isLoadingThisResume = loadingResumeId === jobSeeker.id;

    if (jobSeeker.hasResume && jobSeeker.resumeFileObjectKey) {
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          onClick={() => viewResume(jobSeeker.id, jobSeeker.resumeFileObjectKey, jobSeeker.resumeFileName)}
          disabled={isLoadingThisResume}
          startIcon={isLoadingThisResume ? null : <FileIcon />}
        >
          {isLoadingThisResume ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Opening...
            </>
          ) : (
            "Resume"
          )}
        </Button>
      );
    }

    if (jobSeeker.resumeId && jobSeeker.resumeFileObjectKey) {
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          onClick={() => viewResume(jobSeeker.id, jobSeeker.resumeFileObjectKey, jobSeeker.resumeFileName)}
          disabled={isLoadingThisResume}
          startIcon={isLoadingThisResume ? null : <FileIcon />}
        >
          {isLoadingThisResume ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Opening...
            </>
          ) : (
            "Resume"
          )}
        </Button>
      );
    }

    if (jobSeeker.documents && jobSeeker.documents.length > 0) {
      const resumeDoc =
        jobSeeker.documents.find(
          (doc: any) => doc.type?.toLowerCase().includes("resume") || doc.fileName?.toLowerCase().includes("resume")
        ) || jobSeeker.documents[0];

      if (resumeDoc && resumeDoc.objectKey) {
        return (
          <Button
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
            onClick={() => viewResume(jobSeeker.id, resumeDoc.objectKey, resumeDoc.fileName)}
            disabled={isLoadingThisResume}
            startIcon={isLoadingThisResume ? null : <FileIcon />}
          >
            {isLoadingThisResume ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Opening...
              </>
            ) : (
              "Resume"
            )}
          </Button>
        );
      }
    }

    return (
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
        <FileIcon className="opacity-50" />
        <span>No resume</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-12 px-6" colSpan={9}>
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <FileIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No job seekers found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((jobSeeker: any) => (
              <TableRow
                key={jobSeeker.id}
                data-item-id={jobSeeker.id}
                data-jobseeker-id={jobSeeker.id}
                className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={jobSeeker.profilePicture?.url}
                      alt={jobSeeker.name}
                      name={jobSeeker.name}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{jobSeeker.name}</p>
                      {jobSeeker.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{jobSeeker.email}</p>
                      )}
                      <Link
                        href={`/admin/applications?name=${encodeURIComponent(jobSeeker.name.split(" ")[0])}`}
                        className="text-sm text-blue-500 dark:text-blue-500 hover:text-brand-500 dark:hover:text-brand-400 cursor-pointer transition-colors duration-200"
                      >
                        {jobSeeker.jobApplications} applications
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">{jobSeeker.occupation || "Not specified"}</p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <SpecialtyDisplay
                    specialties={
                      Array.isArray(jobSeeker.specialty)
                        ? jobSeeker.specialty
                        : jobSeeker.specialty
                          ? [jobSeeker.specialty]
                          : []
                    }
                    jobSeekerId={jobSeeker.id}
                    expandedRows={expandedRows}
                    onToggleExpanded={toggleExpanded}
                  />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.city && jobSeeker.state
                      ? `${jobSeeker.city}, ${jobSeeker.state}`
                      : jobSeeker.city || jobSeeker.state || "Not specified"}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.licenses && jobSeeker.licenses.length > 0 ? (
                      <div className="space-y-2">
                        <button
                          ref={getLicensesButtonRef(jobSeeker.id)}
                          onClick={() => openLicensesPopover(jobSeeker.id)}
                          disabled={loadingLicensesId === jobSeeker.id}
                          className="inline-flex items-center justify-center font-medium gap-2 transition bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 h-[45px] w-[100px] rounded-sm px-3 text-xs bg-primary text-primary-foreground text-white shadow hover:bg-primary/90 disabled:bg-primary/50 [&>svg]:text-primary-foreground"
                        >
                          {loadingLicensesId === jobSeeker.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            </>
                          ) : (
                            <>Licenses</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm italic">
                        <IdCardIcon className="opacity-50" />
                        <span>N/A</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.certifications && jobSeeker.certifications.length > 0 ? (
                      <div className="space-y-2">
                        <button
                          ref={getCertificationsButtonRef(jobSeeker.id)}
                          onClick={() => openCertificationsPopover(jobSeeker.id)}
                          disabled={loadingCertificationsId === jobSeeker.id}
                          className="inline-flex items-center justify-center font-medium gap-2 transition bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 h-[45px] w-[100px] rounded-sm px-3 text-xs bg-primary text-primary-foreground text-white shadow hover:bg-primary/90 disabled:bg-primary/50 [&>svg]:text-primary-foreground"
                        >
                          {loadingCertificationsId === jobSeeker.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            </>
                          ) : (
                            <>Certifications</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm italic">
                        <CheckCircleIcon className="opacity-50" />
                        <span>N/A</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-left">{renderResumeButton(jobSeeker)}</TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {jobSeeker.dateJoined ? (
                    (() => {
                      const dateJoined = formatDateTimeEST(jobSeeker.dateJoined);
                      if (typeof dateJoined === "string") {
                        return <p className="text-sm text-gray-900 dark:text-white">{dateJoined}</p>;
                      }
                      return (
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{dateJoined.date}</div>
                          <div className="flex items-center mt-1">
                            <TimeIcon className="mr-1" />
                            <span>{dateJoined.time}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {jobSeeker.lastActivity ? (
                    (() => {
                      const lastActivity = formatDateTimeEST(jobSeeker.lastActivity);
                      if (typeof lastActivity === "string") {
                        return <p className="text-sm text-gray-900 dark:text-white">{lastActivity}</p>;
                      }
                      return (
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{lastActivity.date}</div>
                          <div className="flex items-center mt-1">
                            <TimeIcon className="mr-1" />
                            <span>{lastActivity.time}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">No activity</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={getStatusVariant(jobSeeker.status)}>{jobSeeker.status}</Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center gap-4">
                    <PermissionWrapper module="jobseekers" action="view">
                      <button className="flex gap-2 text-brand-400" onClick={() => onViewJobSeeker(jobSeeker.id)}>
                        <EyeIcon /> View
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper module="jobseekers" action="edit">
                      <button className="flex gap-2 text-brand-400" onClick={() => openEditModal(jobSeeker.id)}>
                        <PencilIcon /> Edit
                      </button>
                    </PermissionWrapper>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedJobSeekerId && (
        <EditJobSeekerModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          jobSeekerId={selectedJobSeekerId}
          onUpdate={() => refreshData(true)}
        />
      )}

      {selectedJobSeekerForShare && (
        <ShareResumeModal
          isOpen={shareModalOpen}
          onClose={closeShareModal}
          jobSeekerName={selectedJobSeekerForShare.name}
          jobSeekerId={selectedJobSeekerForShare.id}
          resumeId={getResumeData(selectedJobSeekerForShare)?.id}
          resumeObjectKey={getResumeData(selectedJobSeekerForShare)?.objectKey}
          resumeFileName={getResumeData(selectedJobSeekerForShare)?.fileName}
        />
      )}

      {/* Licenses Popover */}
      {licensesPopover.isOpen && licensesPopover.jobSeekerId && (
        <LicensesPopover
          licenses={data?.data?.find((js: any) => js.id === licensesPopover.jobSeekerId)?.licenses || []}
          isOpen={licensesPopover.isOpen}
          onClose={closeLicensesPopover}
          triggerRef={getLicensesButtonRef(licensesPopover.jobSeekerId)}
        />
      )}

      {/* Certifications Popover */}
      {certificationsPopover.isOpen && certificationsPopover.jobSeekerId && (
        <CertificationsPopover
          certifications={
            data?.data?.find((js: any) => js.id === certificationsPopover.jobSeekerId)?.certifications || []
          }
          isOpen={certificationsPopover.isOpen}
          onClose={closeCertificationsPopover}
          triggerRef={getCertificationsButtonRef(certificationsPopover.jobSeekerId)}
        />
      )}
    </div>
  );
};

export default JobSeekersTable;
