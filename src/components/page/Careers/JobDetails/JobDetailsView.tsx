"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCareerDetails, useUpdateApplicantStatus } from '@/services/hooks/useCareers';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, MapPin, DollarSign, Building, Users, Calendar, Search, Filter, Edit, Copy, Trash2, Eye, MoreVertical, FileText } from 'lucide-react';
import EditJobPostModal from './components/EditJobPostModal';
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingApplicantId, setUpdatingApplicantId] = useState<string | null>(null);

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

  const { data: jobData, isLoading, isError, refetch } = useCareerDetails(jobId || '');
  const updateApplicantStatusMutation = useUpdateApplicantStatus();

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
      return matchesTab && matchesSearch;
    });
  }, [jobData, activeTab, searchTerm]);

  const handleUpdate = () => {
    refetch();
  };

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDropdownToggle = (applicantId: string) => {
    setOpenDropdown(openDropdown === applicantId ? null : applicantId);
  };

  const handleViewApplicant = (applicant: any) => {
    // TODO: Implement view applicant details
    console.log('View applicant:', applicant);
    setOpenDropdown(null);
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      setUpdatingApplicantId(applicantId);
      await updateApplicantStatusMutation.mutateAsync({
        applicantId,
        status: newStatus as 'PENDING' | 'QUALIFIED' | 'NOT_QUALIFIED'
      });
      
      // Close dropdown and refresh data
      setOpenDropdown(null);
      // The mutation will automatically invalidate queries and refresh the data
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error updating applicant status:', error);
    } finally {
      setUpdatingApplicantId(null);
    }
  };

  const handleViewResume = (resumeUrl: string) => {
    window.open(resumeUrl, '_blank');
    setOpenDropdown(null);
  };

  // Handle conditional rendering after all hooks are called
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            &larr; Back to Careers
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEditModal}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job Post
          </Button>
          <Button variant="outline"><Copy className="w-4 h-4 mr-2" /> Duplicate</Button>
          <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Close Job Post</Button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
        <h2 className="text-xl font-semibold mb-4">Job Information</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500" /><h2 className='font-semibold'>{job.jobTitle}</h2></div>
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500" /><span>{job.jobType}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><span>{job.city}</span></div>
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-500" /><span>{job.salaryRange || 'Not specified'}</span></div>
          {job.department &&
            <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-500" /><span>{job.department}</span></div>
          }
        </div>
      </div>

      <div className="flex gap-6 mb-6">
        {/* Job Description Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex-1">
          <h3 className="text-lg font-medium mb-4">Job Description</h3>
          
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: job.jobDescription || job.description || '' }}
            />
          </div>
        </div>

        {/* Applicants Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Applicants ({statusCounts.All})</h2>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Search applicants..." 
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
          </div>

          <div className="border-b mb-4">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs ${
                    activeTab === status
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {formatStatusDisplay(status)} ({count})
                </button>
              ))}
            </nav>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader={true}>Name</TableCell>
                <TableCell isHeader={true}>Email</TableCell>
                <TableCell isHeader={true}>Phone</TableCell>
                <TableCell isHeader={true}>Applied On</TableCell>
                <TableCell isHeader={true}>Status</TableCell>
                <TableCell isHeader={true}>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant: any) => (
                  <TableRow key={applicant.id} className={updatingApplicantId === applicant.id ? 'opacity-60 pointer-events-none' : ''}>
                    <TableCell>{applicant.fullName}</TableCell>
                    <TableCell>{applicant.email}</TableCell>
                    <TableCell>{applicant.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {new Date(applicant.applicationDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <Badge 
                          variant="light"
                          color={
                            applicant.status === 'PENDING' ? 'warning' : 
                            applicant.status === 'QUALIFIED' ? 'success' : 
                            'error'
                          }
                          className="text-xs px-2 py-1"
                        >
                          {formatStatusDisplay(applicant.status)}
                        </Badge>
                        {updatingApplicantId === applicant.id && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-12 relative">
                      <div className="flex justify-center items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="!h-8 !w-8 dropdown-toggle"
                          onClick={() => handleDropdownToggle(applicant.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Dropdown 
                        isOpen={openDropdown === applicant.id} 
                        onClose={() => setOpenDropdown(null)}
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
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No applicants found matching your search.' : 'No applicants have applied for this position yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination would go here */}
        </div>
      </div>
      <EditJobPostModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        job={job}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default JobDetailsView;
