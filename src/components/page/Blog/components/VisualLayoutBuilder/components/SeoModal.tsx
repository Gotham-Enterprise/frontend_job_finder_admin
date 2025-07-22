import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';

interface SeoData {
  title: string;
  description: string;
  keywords: string;
}

interface SeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SeoData;
  onSave: (data: SeoData) => void;
}

const SeoModal: React.FC<SeoModalProps> = ({
  isOpen,
  onClose,
  initialData = { title: '', description: '', keywords: '' },
  onSave
}) => {
  const [seoData, setSeoData] = useState<SeoData>(initialData);
  const [errors, setErrors] = useState<Partial<SeoData>>({});

  const updateField = (field: keyof SeoData, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SeoData> = {};

    if (!seoData.title.trim()) {
      newErrors.title = 'SEO title is required';
    } else if (seoData.title.length > 60) {
      newErrors.title = 'SEO title should be under 60 characters';
    }

    if (!seoData.description.trim()) {
      newErrors.description = 'SEO description is required';
    } else if (seoData.description.length > 160) {
      newErrors.description = 'SEO description should be under 160 characters';
    }

    if (seoData.keywords.trim() && seoData.keywords.split(',').length > 10) {
      newErrors.keywords = 'Maximum 10 keywords allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSeoData = () => {
    if (validateForm()) {
      onSave(seoData);
      closeModal();
    }
  };

  const closeModal = () => {
    setSeoData(initialData);
    setErrors({});
    onClose();
  };

  const isFormValid = seoData.title.trim() && seoData.description.trim();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={closeModal} 
      isFullscreen={false} 
      className="max-w-2xl mx-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            SEO Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Optimize your content for search engines by adding meta information
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="seoTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              SEO Title
              <span className="text-red-500 ml-1">*</span>
              <span className="text-xs font-normal text-gray-500 ml-2">
                ({seoData.title.length}/60 characters)
              </span>
            </Label>
            <Input
              id="seoTitle"
              type="text"
              defaultValue={seoData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter SEO title (recommended: 50-60 characters)"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This title will appear in search engine results and browser tabs
            </p>
          </div>

          <div>
            <Label htmlFor="seoDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              SEO Description
              <span className="text-red-500 ml-1">*</span>
              <span className="text-xs font-normal text-gray-500 ml-2">
                ({seoData.description.length}/160 characters)
              </span>
            </Label>
            <TextArea
              placeholder="Enter SEO description (recommended: 150-160 characters)"
              rows={4}
              value={seoData.description}
              onChange={(value) => updateField('description', value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This description will appear in search engine results under your title
            </p>
          </div>

          <div>
            <Label htmlFor="seoKeywords" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Keywords
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Optional - {seoData.keywords ? seoData.keywords.split(',').filter(k => k.trim()).length : 0}/10 keywords)
              </span>
            </Label>
            <Input
              id="seoKeywords"
              type="text"
              defaultValue={seoData.keywords}
              onChange={(e) => updateField('keywords', e.target.value)}
              placeholder="Enter keywords separated by commas (e.g., react, javascript, web development)"
              className={errors.keywords ? 'border-red-500' : ''}
            />
            {errors.keywords && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.keywords}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add relevant keywords to help search engines understand your content
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  SEO Best Practices
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Keep titles under 60 characters for optimal display</li>
                  <li>• Write descriptions between 150-160 characters</li>
                  <li>• Use descriptive, relevant keywords naturally</li>
                  <li>• Make titles and descriptions compelling for users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={saveSeoData}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save SEO Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SeoModal;
