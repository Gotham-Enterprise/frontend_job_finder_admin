import React, { useEffect, useState } from 'react';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import Label from '../../../form/Label';
import { EditCouponModalProps, UpdateCouponFormData } from '@/services/types/CouponsTypes';

const EditCouponModal: React.FC<EditCouponModalProps> = ({
  isOpen,
  coupon,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UpdateCouponFormData>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateCouponFormData, string>>>({});

  useEffect(() => {
    if (!isOpen || !coupon) return;

    setFormData({
      title: coupon.title || '',
      description: coupon.description || '',
    });
    setErrors({});
  }, [isOpen, coupon]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateCouponFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3 || formData.title.trim().length > 100) {
      newErrors.title = 'Title must be between 3 and 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormField = <K extends keyof UpdateCouponFormData>(
    field: K,
    value: UpdateCouponFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
  };

  const isFormComplete = (): boolean => {
    const title = formData.title.trim();
    return title.length >= 3 && title.length <= 100 && formData.description.trim().length > 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl w-full rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex max-h-[85vh] flex-col bg-white dark:bg-gray-900">
        <div className="shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Coupon</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update the title and description. Discount, duration, and redemption code cannot be changed.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <Label htmlFor="edit-coupon-title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Coupon Title
            </Label>
            <Input
              id="edit-coupon-title"
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="Enter coupon title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-coupon-description" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Description
            </Label>
            <textarea
              id="edit-coupon-description"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Enter coupon description"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end space-x-3 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={submitForm}
            disabled={isLoading || !isFormComplete()}
            className="bg-brand-500 hover:bg-brand-600 text-white border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCouponModal;
