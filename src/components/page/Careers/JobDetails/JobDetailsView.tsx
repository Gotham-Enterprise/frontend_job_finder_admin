"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCareerDetails } from '@/services/hooks/useCareers';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, Briefcase, MapPin, DollarSign, Building, Users, Calendar, Search, Filter, Edit, Copy, Trash2, Eye, MoreVertical } from 'lucide-react';
import EditJobPostModal from './components/EditJobPostModal';

interface JobDetailsViewProps {
  jobId: string;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ jobId }) => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const { data: jobData, isLoading, isError, refetch } = useCareerDetails(jobId || '');

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = { All: 0, Pending: 0, Qualified: 0, 'Not Qualified': 0 };
    if (jobData?.data?.applicants?.items) {
      counts.All = jobData.data.applicants.items.length;
      jobData.data.applicants.items.forEach(applicant => {
        if (counts[applicant.status] !== undefined) {
          counts[applicant.status]++;
        }
      });
    }
    return counts;
  }, [jobData]);

  const filteredApplicants = useMemo(() => {
    if (!jobData?.data?.applicants?.items) return [];
    return jobData.data.applicants.items.filter(applicant => {
      const matchesTab = activeTab === 'All' || applicant.status === activeTab;
      const matchesSearch = searchTerm === '' || 
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.phone && applicant.phone.includes(searchTerm));
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

        <div className="border-t pt-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setDescriptionOpen(!descriptionOpen)}>
            <h3 className="text-lg font-medium">Job Description</h3>
            {descriptionOpen ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {descriptionOpen && (
            <div className="mt-3">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.jobDescription || job.description || '' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
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
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === status
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status} ({count})
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
            {filteredApplicants.map(applicant => (
              <TableRow key={applicant.id}>
                <TableCell>{applicant.name}</TableCell>
                <TableCell>{applicant.email}</TableCell>
                <TableCell>{applicant.phone || 'N/A'}</TableCell>
                <TableCell>{new Date(applicant.appliedDate).toLocaleDateString()}</TableCell>
                <TableCell><Badge>{applicant.status}</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination would go here */}
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
