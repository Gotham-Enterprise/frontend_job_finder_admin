"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { PaperPlaneIcon, EnvelopeIcon } from '@/icons';
import { useToast } from '@/context/ToastContext';
import { jobSeekerApi } from '@/services/api/jobSeeker';

interface ShareResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSeekerName: string;
  jobSeekerId: string;
  resumeId?: string;
  resumeObjectKey?: string;
  resumeFileName?: string;
}

export const ShareResumeModal: React.FC<ShareResumeModalProps> = ({
  isOpen,
  onClose,
  jobSeekerName,
  jobSeekerId,
  resumeId,
  resumeObjectKey,
  resumeFileName,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addToast({
        variant: 'error',
        title: 'Email Required',
        message: 'Please enter an email address to share the resume.',
        duration: 5000,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast({
        variant: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we have a resume to share
      if (!resumeId && !resumeObjectKey) {
        addToast({
          variant: 'error',
          title: 'No Resume Found',
          message: 'No resume available to share for this job seeker.',
          duration: 5000,
        });
        return;
      }

      // Use resumeId if available, otherwise fall back to resumeObjectKey
      const idToUse = resumeId || resumeObjectKey;
      
      // Call the actual API to share resume
      console.log('Sharing resume with ID:', idToUse, 'to email:', email);
      const response = await jobSeekerApi.shareResume(idToUse!, { email });

      if (response.success) {
        addToast({
          variant: 'success',
          title: 'Resume Shared Successfully',
          message: response.message || `${jobSeekerName}'s resume has been shared to ${email}`,
          duration: 5000,
        });

        setEmail('');
        onClose();
      } else {
        addToast({
          variant: 'error',
          title: 'Share Failed',
          message: response.message || 'Failed to share the resume. Please try again.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error sharing resume:', error);
      addToast({
        variant: 'error',
        title: 'Share Failed',
        message: 'Failed to share the resume. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={initClose} isFullscreen={false} className="max-w-md mx-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <PaperPlaneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Resume
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {jobSeekerName}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-800"
                placeholder="Enter email address"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={initClose}
              disabled={isSubmitting}
              className="flex-1 h-[45px] rounded-sm px-7 inline-flex items-center justify-center font-medium gap-2 transition border bg-transparent hover:bg-transparent hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              variant="default"
              disabled={isSubmitting || !email.trim()}
              className="flex-1 bg-primary text-white"
              startIcon={isSubmitting ? null : <PaperPlaneIcon />}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Share'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};