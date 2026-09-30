import React, { useState } from 'react';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import Label from '../../../form/Label';
import Checkbox from '../../../form/input/Checkbox';
import { Radio } from '../../../ui/radio';
import { CreateCouponModalProps, CreateCouponFormData, CouponDuration } from '@/services/types/CouponsTypes';
import { sanitizeNumericInput, sanitizeCurrencyInput, isValidNumericKeyPress } from '@/services/utils/inputValidation';
import { COUPON_DURATION_MONTH_PRESETS } from '@/services/utils/couponDuration';

const DURATION_OPTIONS: Array<{ value: CouponDuration; label: string; hint: string }> = [
  { value: 'once', label: 'Once', hint: 'First invoice only' },
  { value: 'repeating', label: 'Repeating', hint: 'For a set number of months' },
];

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateCouponFormData>({
    title: '',
    description: '',
    isOnlyAdminCanApply: false,
    discountType: 'percentage',
    amountOffInCents: undefined,
    percentOff: undefined,
    duration: 'once',
    durationInMonths: undefined,
    maxRedemptions: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCouponFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCouponFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.discountType === 'amount') {
      if (!formData.amountOffInCents || formData.amountOffInCents <= 0) {
        newErrors.amountOffInCents = 'Amount must be greater than 0';
      }
     
    } else if (formData.discountType === 'percentage') {
      if (!formData.percentOff || formData.percentOff <= 0 || formData.percentOff > 100) {
        newErrors.percentOff = 'Percentage must be between 0.1 and 100';
      }
    }

    if (formData.duration === 'repeating') {
      const months = formData.durationInMonths;
      if (!months || !Number.isInteger(months) || months < 1 || months > 120) {
        newErrors.durationInMonths = 'Enter a whole number of months between 1 and 120';
      }
    }

    if (formData.maxRedemptions !== undefined) {
      const redemptions = formData.maxRedemptions;
      if (!Number.isInteger(redemptions) || redemptions < 1) {
        newErrors.maxRedemptions = 'Enter a whole number of at least 1, or leave blank for unlimited';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isOnlyAdminCanApply: false,
      discountType: 'percentage',
      amountOffInCents: undefined,
      percentOff: undefined,
      duration: 'once',
      durationInMonths: undefined,
      maxRedemptions: undefined,
    });
    setErrors({});
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    const submitData: CreateCouponFormData = {
      ...formData,
      amountOffInCents: formData.discountType === 'amount' ? formData.amountOffInCents : undefined,
      percentOff: formData.discountType === 'percentage' ? formData.percentOff : undefined,
      durationInMonths: formData.duration === 'repeating' ? formData.durationInMonths : undefined,
      maxRedemptions: formData.maxRedemptions,
    };

    await onSubmit(submitData);
  };

  const updateFormField = <K extends keyof CreateCouponFormData>(
    field: K,
    value: CreateCouponFormData[K]
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'discountType') {
        if (value === 'percentage') {
          updated.amountOffInCents = undefined;
        } else if (value === 'amount') {
          updated.percentOff = undefined;
        }
      }

      if (field === 'duration' && value !== 'repeating') {
        updated.durationInMonths = undefined;
      }
      
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (field === 'discountType') {
      setErrors(prev => ({
        ...prev,
        amountOffInCents: undefined,
        percentOff: undefined,
      }));
    }

    if (field === 'duration' && value !== 'repeating') {
      setErrors(prev => ({ ...prev, durationInMonths: undefined }));
    }
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const isFormComplete = (): boolean => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return false;
    }
    if (formData.discountType === 'amount') {
      if (!(formData.amountOffInCents && formData.amountOffInCents > 0)) {
        return false;
      }
    } else if (formData.discountType === 'percentage') {
      if (!(formData.percentOff && formData.percentOff > 0 && formData.percentOff <= 100)) {
        return false;
      }
    } else {
      return false;
    }

    if (formData.duration === 'repeating') {
      const months = formData.durationInMonths;
      if (!(!!months && Number.isInteger(months) && months >= 1 && months <= 120)) {
        return false;
      }
    }

    if (formData.maxRedemptions !== undefined) {
      return Number.isInteger(formData.maxRedemptions) && formData.maxRedemptions >= 1;
    }

    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isFullscreen={false} className="max-w-2xl mx-auto my-8">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Coupon</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in the details to create a new discount coupon
          </p>
        </div>

        <div className="space-y-6">
          {/* Title Section */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Coupon Title
            </Label>
            <Input
              id="title"
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

          {/* Description Section */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Description
            </Label>
            <textarea
              id="description"
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

          {/* Admin Only Checkbox */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="adminOnly"
              checked={formData.isOnlyAdminCanApply}
              onChange={(checked) => updateFormField('isOnlyAdminCanApply', checked)}
            />
            <Label htmlFor="adminOnly" className="text-sm text-gray-700 dark:text-gray-300">
              Admin Only Coupon
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only admin users can apply this coupon to customers
              </span>
            </Label>
          </div>

          {/* Discount Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Discount Type
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Radio
                name="discountType"
                value="percentage"
                checked={formData.discountType === 'percentage'}
                onChange={(value) => updateFormField('discountType', value as 'percentage')}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Percentage Off
              </Radio>
              <Radio
                name="discountType"
                value="amount"
                checked={formData.discountType === 'amount'}
                onChange={(value) => updateFormField('discountType', value as 'amount')}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Fixed Amount
              </Radio>
            </div>
          </div>

          {/* Discount Value Input */}
          {formData.discountType === 'percentage' ? (
            <div>
              <Label htmlFor="percentOff" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Percentage Off (0.1% - 100%)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="percentOff"
                  type="text"
                  value={formData.percentOff || ''}
                  onChange={(e) => {
                    const sanitizedValue = sanitizeNumericInput(e.target.value);
                    updateFormField('percentOff', parseFloat(sanitizedValue) || undefined);
                  }}
                  onKeyDown={(e) => {
                    if (!isValidNumericKeyPress(e)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g., 15.5"
                  className={errors.percentOff ? 'border-red-500 pr-8' : 'pr-8'}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {errors.percentOff && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.percentOff}</p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="amountOff" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount Off ($)
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <Input
                  id="amountOff"
                  type="text"
                  value={formData.amountOffInCents ? (formData.amountOffInCents / 100).toString() : ''}
                  onChange={(e) => {
                    const sanitizedValue = sanitizeCurrencyInput(e.target.value);
                    const dollarAmount = parseFloat(sanitizedValue) || 0;
                    updateFormField('amountOffInCents', Math.round(dollarAmount * 100));
                  }}
                  onKeyDown={(e) => {
                    if (!isValidNumericKeyPress(e)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g., 1500.00"
                  className={`pl-8 ${errors.amountOffInCents ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.amountOffInCents && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.amountOffInCents}</p>
              )}
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Duration
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((option) => (
                <Radio
                  key={option.value}
                  name="duration"
                  value={option.value}
                  checked={formData.duration === option.value}
                  onChange={(value) => updateFormField('duration', value as CouponDuration)}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 items-start"
                >
                  <span className="block font-medium text-gray-900 dark:text-white">{option.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{option.hint}</span>
                </Radio>
              ))}
            </div>
          </div>

          {formData.duration === 'repeating' && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Repeating duration (months)
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COUPON_DURATION_MONTH_PRESETS.map((months) => {
                  const isSelected = formData.durationInMonths === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => updateFormField('durationInMonths', months)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {months} {months === 1 ? 'month' : 'months'}
                    </button>
                  );
                })}
              </div>
              <Label htmlFor="durationInMonths" className="text-sm text-gray-600 dark:text-gray-400">
                Or enter a custom number of months (1–120)
              </Label>
              <Input
                id="durationInMonths"
                type="text"
                inputMode="numeric"
                value={formData.durationInMonths ?? ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
                  updateFormField('durationInMonths', digits ? parseInt(digits, 10) : undefined);
                }}
                placeholder="e.g., 6"
                className={`mt-1 ${errors.durationInMonths ? 'border-red-500' : ''}`}
              />
              {errors.durationInMonths && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.durationInMonths}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="maxRedemptions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Max redemptions
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
              Leave blank for unlimited redemptions
            </p>
            <Input
              id="maxRedemptions"
              type="text"
              inputMode="numeric"
              value={formData.maxRedemptions ?? ''}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                updateFormField('maxRedemptions', digits ? parseInt(digits, 10) : undefined);
              }}
              placeholder="Unlimited"
              className={errors.maxRedemptions ? 'border-red-500' : ''}
            />
            {errors.maxRedemptions && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.maxRedemptions}</p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:text-white dark:border-gray-700">
          <Button
            variant="outline"
            onClick={closeModal}
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
            {isLoading ? 'Creating...' : 'Create Coupon'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCouponModal;
