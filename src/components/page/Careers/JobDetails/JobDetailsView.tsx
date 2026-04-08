"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCareerDetails, useUpdateApplicantStatus, useDuplicateCareer, useToggleCareer } from '@/services/hooks/useCareers';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Badge from '@/components/ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableHeaderCellClass,
  dataTableHeaderRowClass,
  dataTableScrollWrapClass,
  dataTableTableClass,
  dataTableTruncatedTextClass,
} from '@/components/ui/table';
import { Briefcase, MapPin, DollarSign, Building, Users, Calendar as CalendarIcon, Search, Edit, Copy, Trash2, Eye, MoreVertical, FileText, XCircle, CheckCircle } from 'lucide-react';
import DateRangePicker, { DateRange } from '@/components/ui/date-range/DateRangePicker';
import EditJobPostModal from './components/EditJobPostModal';
import ViewApplicantModal from './components/ViewApplicantModal';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';

interface JobDetailsViewProps {
  jobId: string;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ jobId }) => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewApplicantModalOpen, setViewApplicantModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  /** Kebab anchor for Floating UI portaled menu (escapes table overflow clipping). */
  const [applicantMenuAnchor, setApplicantMenuAnchor] = useState<HTMLElement | null>(null);
  const [updatingApplicantId, setUpdatingApplicantId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const startDate = dateRange?.from ? dateRange.from.toISOString().slice(0,10) : '';
  const endDate = dateRange?.to ? dateRange.to.toISOString().slice(0,10) : '';

  // Function to format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return 'Not specified';
    const str = String(value);
    // Check if it's a rangeda
    const parts = str.split('-').map(s => s.trim());
    if (parts.length === 2) {
      const start = parseFloat(parts[0].replace(/,/g, ''));
      const end = parseFloat(parts[1].replace(/,/g, ''));
      if (!isNaN(start) && !isNaN(end)) {
        return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(start)} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(end)}`;
      }
    }
    // Single value
    const num = parseFloat(str.replace(/,/g, ''));
    if (!isNaN(num)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
    return str;
  };

  // Function to format status for display
  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'NOT_QUALIFIED':
        return 'NOT QUALIFIED';
      case 'QUALIFIED':
        return 'QUALIFIED';
      case 'PENDING':
        return 'PENDING';
      default:
        return status;
    }
  };

  // Contextual empty state messaging for applicants table
  const getEmptyStateMessage = () => {
    const hasFilters = !!searchTerm || !!dateRange?.from || !!dateRange?.to;
    if (hasFilters) {
      return 'No applicants match your current search or filters.';
    }
    switch (activeTab) {
      case 'All':
        return 'No applicants have applied for this position yet.';
      case 'PENDING':
        return statusCounts.All > 0 ? 'No pending applicants.' : 'No applicants have applied for this position yet.';
      case 'QUALIFIED':
        return statusCounts.All > 0 ? 'No qualified applicants yet.' : 'No applicants have applied for this position yet.';
      case 'NOT_QUALIFIED':
        return statusCounts.All > 0 ? 'No not-qualified applicants.' : 'No applicants have applied for this position yet.';
      default:
        return 'No applicants found.';
    }
  };

  const { data: jobData, isLoading, isError, refetch } = useCareerDetails(jobId || '');
  const updateApplicantStatusMutation = useUpdateApplicantStatus();
  const duplicateCareerMutation = useDuplicateCareer();
  const toggleCareerMutation = useToggleCareer();

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = { All: 0, PENDING: 0, QUALIFIED: 0, NOT_QUALIFIED: 0 };
    if (jobData?.data?.applicants && Array.isArray(jobData.data.applicants)) {
      counts.All = jobData.data.applicants.length;
      jobData.data.applicants.forEach((applicant: any) => {
        if (counts[applicant.status] !== undefined) {
          counts[applicant.status]++;
        }
      });
    }
    return counts;
  }, [jobData]);

  const filteredApplicants = useMemo(() => {
    if (!jobData?.data?.applicants || !Array.isArray(jobData.data.applicants)) return [];
    
    return jobData.data.applicants.filter((applicant: any) => {
      const matchesTab = activeTab === 'All' || applicant.status === activeTab;
      const matchesSearch = searchTerm === '' || 
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.phoneNumber && applicant.phoneNumber.includes(searchTerm));
      
      let matchesDate = true;
      if (dateRange?.from || dateRange?.to) {
        // Use the actual Date objects from dateRange instead of string conversion
        const applied = new Date(applicant.applicationDate);
        
        // Normalize the applied date to start of day for comparison
        const appliedNormalized = new Date(applied);
        appliedNormalized.setHours(0, 0, 0, 0);
        
        if (dateRange.from) {
          const start = new Date(dateRange.from);
          start.setHours(0, 0, 0, 0);
          if (appliedNormalized < start) matchesDate = false;
        }
        
        if (dateRange.to) {
          const end = new Date(dateRange.to);
          end.setHours(0, 0, 0, 0);
          if (appliedNormalized > end) matchesDate = false;
        }
      }
      return matchesTab && matchesSearch && matchesDate;
    });
  }, [jobData, activeTab, searchTerm, dateRange]);

  const handleUpdate = () => {
    refetch();
  };

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDuplicateJob = async () => {
    try {
      setIsDuplicating(true);
      await duplicateCareerMutation.mutateAsync(jobId);
      
      router.push('/admin/careers');
    } catch (error) {
      console.error('Error duplicating job:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleToggleJob = async () => {
    try {
      setIsToggling(true);
      await toggleCareerMutation.mutateAsync(jobId);
      // Redirect to careers list after successful toggle
      router.push('/admin/careers');
    } catch (error) {
      console.error('Error toggling job status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const closeApplicantMenu = () => {
    setOpenDropdown(null);
    setApplicantMenuAnchor(null);
  };

  const handleDropdownToggle = (applicantId: string, anchorEl: HTMLElement) => {
    if (openDropdown === applicantId) {
      closeApplicantMenu();
    } else {
      setOpenDropdown(applicantId);
      setApplicantMenuAnchor(anchorEl);
    }
  };

  const handleViewApplicant = (applicant: any) => {
    setSelectedApplicant(applicant);
    setViewApplicantModalOpen(true);
    closeApplicantMenu();
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      setUpdatingApplicantId(applicantId);
      await updateApplicantStatusMutation.mutateAsync({
        applicantId,
        status: newStatus as 'PENDING' | 'QUALIFIED' | 'NOT_QUALIFIED'
      });
      
      closeApplicantMenu();
    } catch (error) {
      console.error('Error updating applicant status:', error);
    } finally {
      setUpdatingApplicantId(null);
    }
  };

  const handleViewResume = (resumeUrl: string) => {
    window.open(resumeUrl, '_blank');
    closeApplicantMenu();
  };

  if (!jobId) {
    return <div>No job ID provided in URL.</div>;
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    return <div>Error loading job details. Please try again.</div>;
  }
  if (!jobData?.data) {
    return <div>No job data found.</div>;
  }

  const { data: job } = jobData;

  // Determine if job is active or not
  const isJobActive = job?.isActive;
  const toggleButtonText = isJobActive ? 'Close Job Post' : 'Reopen Job Post';
  const toggleButtonVariant = isJobActive ? 'destructive' : 'default';
  const toggleButtonIcon = isJobActive ? XCircle : CheckCircle;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            &larr; Back to Careers
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={openEditModal}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job Post
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDuplicateJob}
            disabled={isDuplicating}
          >
            <Copy className="w-4 h-4 mr-2" /> 
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </Button>
          <Button 
            variant={toggleButtonVariant} 
            onClick={handleToggleJob}
            disabled={isToggling}
          >
            {React.createElement(toggleButtonIcon, { className: "w-4 h-4 mr-2" })}
            {isToggling ? 'Processing...' : toggleButtonText}
          </Button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Job Information</h2>
          <Badge
            variant="light"
            color={job.isActive ? 'success' : 'error'}
            className="text-sm px-3 py-1"
          >
            {job.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold">{job.jobTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>{job.jobType}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{job.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>{formatCurrency(job.salaryRange)}</span>
          </div>
          {job.department && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span>{job.department}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
        {/* Job Description — narrower column (~38%) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:min-w-0 lg:max-w-[40%] lg:flex-[0_0_38%] xl:flex-[0_0_36%]">
          <h3 className="text-lg font-medium mb-4">Job Description</h3>

          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: job.jobDescription || job.description || '' }}
            />
          </div>
        </div>

        {/* Applicants — takes remaining width (~62%+) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 flex-1">
          <div className="mb-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold shrink-0">Applicants ({statusCounts.All})</h2>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              <Input 
                placeholder="Search applicants..." 
                className="w-full min-w-[200px] sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="mb-4 border-b overflow-x-auto overscroll-x-contain">
            <nav className="-mb-px flex min-w-max gap-6 sm:gap-8 px-0.5">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs ${
                    activeTab === status
                      ? 'border-green-700 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {formatStatusDisplay(status)} ({count})
                </button>
              ))}
            </nav>
          </div>

          <div className={dataTableScrollWrapClass}>
            <Table className={`${dataTableTableClass} min-w-[720px]`}>
              <colgroup>
                <col style={{ width: '24%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '64px' }} />
              </colgroup>
              <TableHeader>
                <TableRow className={dataTableHeaderRowClass}>
                  <TableCell isHeader className={dataTableHeaderCellClass}>
                    Name
                  </TableCell>
                  <TableCell isHeader className={dataTableHeaderCellClass}>
                    Email
                  </TableCell>
                  <TableCell isHeader className={`${dataTableHeaderCellClass} whitespace-nowrap`}>
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className={`${dataTableHeaderCellClass} whitespace-nowrap text-center`}
                  >
                    Applied On
                  </TableCell>
                  <TableCell
                    isHeader
                    className={`${dataTableHeaderCellClass} whitespace-nowrap text-center`}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className={`${dataTableHeaderCellClass} w-14 max-w-14 whitespace-nowrap text-right pr-4`}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant: any) => (
                  <TableRow
                    key={applicant.id}
                    className={`${dataTableBodyRowClass} ${
                      updatingApplicantId === applicant.id ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <TableCell className={`${dataTableCellClass} min-w-0`}>
                      <span
                        className={dataTableTruncatedTextClass}
                        title={applicant.fullName}
                      >
                        {applicant.fullName}
                      </span>
                    </TableCell>
                    <TableCell className={`${dataTableCellClass} min-w-0`}>
                      <span
                        className={dataTableTruncatedTextClass}
                        title={applicant.email}
                      >
                        {applicant.email}
                      </span>
                    </TableCell>
                    <TableCell className={`${dataTableCellClass} whitespace-nowrap text-gray-700 dark:text-gray-300`}>
                      {applicant.phoneNumber || 'N/A'}
                    </TableCell>
                    <TableCell
                      className={`${dataTableCellClass} whitespace-nowrap text-center tabular-nums text-gray-700 dark:text-gray-300`}
                    >
                      {new Date(applicant.applicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={`${dataTableCellClass} text-center`}>
                      <span className="inline-flex items-center justify-center gap-2 align-middle">
                        <Badge
                          variant="light"
                          color={
                            applicant.status === 'PENDING'
                              ? 'warning'
                              : applicant.status === 'QUALIFIED'
                                ? 'success'
                                : 'error'
                          }
                          className="shrink-0 text-xs px-2.5 py-1"
                        >
                          {formatStatusDisplay(applicant.status)}
                        </Badge>
                        {updatingApplicantId === applicant.id && (
                          <span
                            className="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            aria-hidden
                          />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className={`${dataTableCellClass} relative w-14 max-w-14 whitespace-nowrap pl-2 pr-3 text-right`}>
                      <div className="flex justify-end">
                        <span
                          id={`applicant-menu-trigger-${applicant.id}`}
                          className="dropdown-toggle inline-flex"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="!h-8 !w-8 shrink-0"
                            onClick={() => {
                              const el = document.getElementById(
                                `applicant-menu-trigger-${applicant.id}`,
                              );
                              if (el instanceof HTMLElement) {
                                handleDropdownToggle(applicant.id, el);
                              }
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </span>
                      </div>
                      
                      <Dropdown 
                        isOpen={openDropdown === applicant.id} 
                        onClose={closeApplicantMenu}
                        referenceElement={
                          openDropdown === applicant.id ? applicantMenuAnchor : null
                        }
                        className="min-w-48"
                      >
                        <DropdownItem 
                          onClick={() => handleViewApplicant(applicant)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Applicant
                        </DropdownItem>
                        
                        {applicant.resumeUrl && (
                          <DropdownItem 
                            onClick={() => handleViewResume(applicant.resumeUrl)}
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Resume
                          </DropdownItem>
                        )}
                        
                        {applicant.coverLetterUrl && (
                          <DropdownItem 
                            onClick={() => handleViewResume(applicant.coverLetterUrl)}
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Cover Letter
                          </DropdownItem>
                        )}
                        
                        <div className="border-t border-gray-200 my-1"></div>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
                          Change Status
                        </div>
                        
                        <DropdownItem 
                          onClick={() => updatingApplicantId !== applicant.id && handleStatusChange(applicant.id, 'PENDING')}
                          className={`flex items-center gap-2 text-yellow-600 ${updatingApplicantId === applicant.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Pending
                          {updatingApplicantId === applicant.id && <span className="ml-auto">...</span>}
                        </DropdownItem>
                        
                        <DropdownItem 
                          onClick={() => updatingApplicantId !== applicant.id && handleStatusChange(applicant.id, 'QUALIFIED')}
                          className={`flex items-center gap-2 text-green-600 ${updatingApplicantId === applicant.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Qualified
                          {updatingApplicantId === applicant.id && <span className="ml-auto">...</span>}
                        </DropdownItem>
                        
                        <DropdownItem 
                          onClick={() => updatingApplicantId !== applicant.id && handleStatusChange(applicant.id, 'NOT_QUALIFIED')}
                          className={`flex items-center gap-2 text-red-600 ${updatingApplicantId === applicant.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          Not Qualified
                          {updatingApplicantId === applicant.id && <span className="ml-auto">...</span>}
                        </DropdownItem>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className={dataTableBodyRowClass}>
                  <TableCell
                    colSpan={6}
                    className={`${dataTableCellClass} py-10 text-center text-gray-500 dark:text-gray-400`}
                  >
                    {getEmptyStateMessage()}
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination would go here */}
        </div>
      </div>

      <EditJobPostModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        job={job}
        onUpdate={handleUpdate}
      />
      <ViewApplicantModal
        isOpen={isViewApplicantModalOpen}
        onClose={() => setViewApplicantModalOpen(false)}
        applicant={selectedApplicant}
      />
    </div>
  );
};

export default JobDetailsView;
