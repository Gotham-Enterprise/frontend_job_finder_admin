"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { PaperPlaneIcon, EnvelopeIcon } from '@/icons';
import { useToast } from '@/context/ToastContext';

interface ShareResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSeekerName: string;
  jobSeekerId: string;
  resumeObjectKey?: string;
  resumeFileName?: string;
}

export const ShareResumeModal: React.FC<ShareResumeModalProps> = ({
  isOpen,
  onClose,
  jobSeekerName,
  jobSeekerId,
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
      // TODO: Replace with actual API call to share resume
      // const response = await shareResume({
      //   jobSeekerId,
      //   email,
      //   resumeObjectKey,
      //   resumeFileName
      // });

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      addToast({
        variant: 'success',
        title: 'Resume Shared Successfully',
        message: `${jobSeekerName}'s resume has been shared to ${email}`,
        duration: 5000,
      });

      setEmail('');
      onClose();
    } catch (error) {
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

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isFullscreen={false} className="max-w-md mx-auto">
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
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
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
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-[45px] rounded-sm px-7 inline-flex items-center justify-center font-medium gap-2 transition border bg-transparent hover:bg-transparent hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              variant="default"
              disabled={isSubmitting || !email.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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

        {resumeFileName && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">File:</span> {resumeFileName}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};