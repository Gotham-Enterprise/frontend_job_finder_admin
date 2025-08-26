"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';
import { useCreateCareer } from '@/services/hooks/useCareers';
import type { CreateCareerPayload } from '@/services/api/careers';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createCareerMutation = useCreateCareer();
  
  const [formData, setFormData] = useState<CreateCareerPayload>({
    jobTitle: '',
    jobType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    departmentId: '',
    unitId: '',
    timezone: '',
    salaryRangeStart: undefined,
    salaryRangeEnd: 0,
    jobDescription: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateCareerPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.jobType.trim()) {
      newErrors.jobType = 'Job type is required';
    }
    if (!formData.timezone.trim()) {
      newErrors.timezone = 'Timezone is required';
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload: CreateCareerPayload = {
        ...formData,
      };

      await createCareerMutation.mutateAsync(payload);
      onClose();
      // Reset form
      setFormData({
        jobTitle: '',
        jobType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        departmentId: '',
        unitId: '',
        timezone: '',
        salaryRangeStart: undefined,
        salaryRangeEnd: 0,
        jobDescription: '',
      });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-4 my-8 rounded-lg shadow-xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Job Post
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title
            </label>
            <Input
              type="text"
              placeholder="Job Title name"
              value={formData.jobTitle}
              onChange={handleInputChange('jobTitle')}
              error={!!errors.jobTitle}
              hint={errors.jobTitle}
            />
          </div>

          {/* Location and Job Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="City, State"
                value={`${formData.city}, ${formData.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  const city = parts[0]?.trim() || '';
                  const state = parts[1]?.trim() || '';
                  setFormData(prev => ({ ...prev, city, state }));
                }}
                error={!!errors.city || !!errors.state}
                hint={errors.city || errors.state}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={formData.jobType}
                onChange={handleInputChange('jobType')}
                className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden appearance-none"
              >
                <option value="">Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
              {errors.jobType && (
                <p className="mt-1.5 text-xs text-error-500">{errors.jobType}</p>
              )}
            </div>
          </div>

          {/* Timezone and Salary Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={handleInputChange('timezone')}
                className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden appearance-none"
              >
                <option value="">Timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
              </select>
              {errors.timezone && (
                <p className="mt-1.5 text-xs text-error-500">{errors.timezone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Salary"
                  value={formData.salaryRangeStart || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    setFormData(prev => ({ ...prev, salaryRangeStart: value }));
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max Salary"
                  value={formData.salaryRangeEnd || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, salaryRangeEnd: value }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description
            </label>
            <textarea
              placeholder="Description"
              value={formData.jobDescription}
              onChange={handleInputChange('jobDescription')}
              rows={6}
              className={`w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden placeholder:text-gray-400 resize-none ${
                errors.jobDescription ? 'border-error-500 text-error-800' : ''
              }`}
            />
            {errors.jobDescription && (
              <p className="mt-1.5 text-xs text-error-500">{errors.jobDescription}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={createCareerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(fakeEvent);
              }}
              disabled={createCareerMutation.isPending}
            >
              {createCareerMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
