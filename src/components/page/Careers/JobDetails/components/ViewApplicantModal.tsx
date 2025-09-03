import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { User, Mail, Phone, Calendar, FileText, MapPin, Building, GraduationCap, Briefcase } from 'lucide-react';

interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  applicationDate: string;
  status: 'PENDING' | 'QUALIFIED' | 'NOT_QUALIFIED';
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetterUrl?: string;
  coverLetterFileName?: string;
  avatarUrl?: string;
  avatarFileName?: string;
  address?: string;
  city?: string;
  state?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  message?: string;
}

interface ViewApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

const ViewApplicantModal: React.FC<ViewApplicantModalProps> = ({
  isOpen,
  onClose,
  applicant,
}) => {
  if (!applicant) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'QUALIFIED':
        return 'success';
      case 'NOT_QUALIFIED':
        return 'error';
      default:
        return 'light';
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const getDocumentType = (url: string, filename?: string) => {
    // Use filename if available, otherwise fall back to URL
    const sourceToCheck = filename || url;
    const extension = sourceToCheck.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      default:
        return 'Document';
    }
  };

  const getFileName = (url: string, filename?: string) => {
    // Return the filename if available, otherwise extract from URL
    if (filename) {
      return filename;
    }
    // Extract filename from URL
    return url.split('/').pop() || 'Document';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-4xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-col items-center gap-4">
            <div className='mb-2'>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Applicant Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View applicant information and documents
              </p>
            </div>
            <Badge
              variant="light"
              color={getStatusColor(applicant.status)}
              className="text-sm px-3 py-1"
            >
              {formatStatusDisplay(applicant.status)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                      {applicant.avatarUrl ? (
                        <img 
                          src={applicant.avatarUrl} 
                          alt={`${applicant.fullName}'s avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to User icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-green-700" />
                      )}
                      {applicant.avatarUrl && (
                        <User className="w-6 h-6 text-green-700 hidden" />
                      )}
                    </div>
                    <div>
                      {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                        Full Name
                      </p> */}
                      <p className="font-medium text-gray-900 dark:text-white text-lg">
                        {applicant.fullName}
                      </p>
                      
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email Address
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {applicant.email}
                      </p>
                      
                    </div>
                  </div>

                  {applicant.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Phone Number
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {applicant.phoneNumber}
                        </p>
                        
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Application Date
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(applicant.applicationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                    </div>
                  </div>

                  {(applicant.address || applicant.city || applicant.state) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Location
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {[applicant.address, applicant.city, applicant.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {(applicant.message) && (
                  <div className="space-y-4">
                    {applicant.message && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-green-700 dark:border-green-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-700 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-green-900 dark:text-blue-100 mb-1">
                              Message from Applicant
                            </p>
                            <p className="text-gray-800 dark:text-blue-200 text-sm leading-relaxed">
                              {applicant.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              )}
            </div>

            {/* Right Column - Documents and Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents & Links
                </h3>
                
                <div className="space-y-4">
                  {applicant.resumeUrl && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Resume
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getFileName(applicant.resumeUrl, applicant.resumeFileName)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(applicant.resumeUrl!)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {applicant.coverLetterUrl && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Cover Letter
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getFileName(applicant.coverLetterUrl, applicant.coverLetterFileName)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(applicant.coverLetterUrl!)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {applicant.linkedinUrl && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              LinkedIn Profile
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Professional Network
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(applicant.linkedinUrl!)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {applicant.portfolioUrl && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Portfolio
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Work Samples
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(applicant.portfolioUrl!)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {!applicant.resumeUrl && !applicant.coverLetterUrl && !applicant.linkedinUrl && !applicant.portfolioUrl && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No documents or links available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {applicant.email && (
            <Button
              variant="default"
              onClick={() => {
                const subject = encodeURIComponent('Regarding your job application');
                const body = encodeURIComponent(`Hi ${applicant.fullName},\n\nThank you for your interest in our position.\n\nBest regards,`);
                window.open(`mailto:${applicant.email}?subject=${subject}&body=${body}`);
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Applicant
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewApplicantModal;
