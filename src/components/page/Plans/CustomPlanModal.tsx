'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import { PlanInterval } from '@/services/types/subscription';
import { AdminSubscriptionPlan, CustomPlanPayload } from '@/services/types/subscriptionPlan';

const INTERVALS: { value: PlanInterval; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-annually' },
  { value: 'ANNUALLY', label: 'Annually' },
];

interface CustomPlanFormState {
  name: string;
  description: string;
  priceDollars: string;
  interval: PlanInterval;
  jobPostCredit: string;
  resumeSearchUnlimited: boolean;
  resumeSearchCredit: string;
  profileViewsCredit: string;
  emailSendingCredit: string;
  smsSendingCredit: string;
  resumeDownloadCredit: string;
  employeesSeatsCredit: string;
  isActive: boolean;
}

const emptyForm = (): CustomPlanFormState => ({
  name: '',
  description: '',
  priceDollars: '',
  interval: 'MONTHLY',
  jobPostCredit: '0',
  resumeSearchUnlimited: true,
  resumeSearchCredit: '',
  profileViewsCredit: '0',
  emailSendingCredit: '0',
  smsSendingCredit: '0',
  resumeDownloadCredit: '0',
  employeesSeatsCredit: '0',
  isActive: true,
});

const formFromPlan = (plan: AdminSubscriptionPlan): CustomPlanFormState => ({
  name: plan.name,
  description: plan.description || '',
  priceDollars: (plan.priceInCents / 100).toFixed(2),
  interval: plan.interval,
  jobPostCredit: String(plan.jobPostCredit),
  resumeSearchUnlimited: plan.resumeSearchCredit === null,
  resumeSearchCredit: plan.resumeSearchCredit === null ? '' : String(plan.resumeSearchCredit),
  profileViewsCredit: String(plan.profileViewsCredit),
  emailSendingCredit: String(plan.emailSendingCredit),
  smsSendingCredit: String(plan.smsSendingCredit ?? 0),
  resumeDownloadCredit: String(plan.resumeDownloadCredit),
  employeesSeatsCredit: String(plan.employeesSeatsCredit),
  isActive: plan.isActive,
});

const wholeNumber = (value: string) => /^\d+$/.test(value.trim());

interface CustomPlanModalProps {
  isOpen: boolean;
  plan: AdminSubscriptionPlan | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CustomPlanPayload) => void;
}

const CustomPlanModal: React.FC<CustomPlanModalProps> = ({
  isOpen,
  plan,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<CustomPlanFormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof CustomPlanFormState, string>>>({});

  useEffect(() => {
    if (!isOpen) return;
    setForm(plan ? formFromPlan(plan) : emptyForm());
    setErrors({});
  }, [isOpen, plan]);

  const updateField = <K extends keyof CustomPlanFormState>(key: K, value: CustomPlanFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CustomPlanFormState, string>> = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }
    const price = Number(form.priceDollars);
    if (form.priceDollars.trim() === '' || Number.isNaN(price) || price < 0) {
      nextErrors.priceDollars = 'Enter a price of 0 or more.';
    }
    const creditFields: Array<keyof CustomPlanFormState> = [
      'jobPostCredit',
      'profileViewsCredit',
      'emailSendingCredit',
      'smsSendingCredit',
      'resumeDownloadCredit',
      'employeesSeatsCredit',
    ];
    creditFields.forEach((field) => {
      if (!wholeNumber(String(form[field]))) {
        nextErrors[field] = 'Enter a whole number of 0 or more.';
      }
    });
    if (!form.resumeSearchUnlimited && !wholeNumber(form.resumeSearchCredit)) {
      nextErrors.resumeSearchCredit = 'Enter a whole number, or mark resume search as unlimited.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      priceInCents: Math.round(Number(form.priceDollars) * 100),
      interval: form.interval,
      jobPostCredit: Number(form.jobPostCredit),
      resumeSearchCredit: form.resumeSearchUnlimited ? null : Number(form.resumeSearchCredit),
      profileViewsCredit: Number(form.profileViewsCredit),
      emailSendingCredit: Number(form.emailSendingCredit),
      smsSendingCredit: Number(form.smsSendingCredit),
      resumeDownloadCredit: Number(form.resumeDownloadCredit),
      employeesSeatsCredit: Number(form.employeesSeatsCredit),
      isActive: form.isActive,
    });
  };

  const field = (
    id: keyof CustomPlanFormState,
    label: string,
    input: React.ReactNode
  ) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {input}
      {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-h-[90vh] max-w-2xl overflow-y-auto p-6" isFullscreen={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {plan ? 'Edit custom plan' : 'Create custom plan'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This plan stays off the public pricing page. Admins can assign it when purchasing or sending a quote.
          </p>
        </div>

        {field(
          'name',
          'Name',
          <Input
            id="name"
            value={form.name}
            error={Boolean(errors.name)}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Acme annual agreement"
          />
        )}

        {field(
          'description',
          'Description',
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            placeholder="Optional notes for admins"
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field(
            'priceDollars',
            'Price (USD)',
            <Input
              id="priceDollars"
              inputMode="decimal"
              value={form.priceDollars}
              error={Boolean(errors.priceDollars)}
              onChange={(event) => updateField('priceDollars', event.target.value)}
              placeholder="499.00"
            />
          )}
          {field(
            'interval',
            'Billing interval',
            <select
              id="interval"
              value={form.interval}
              onChange={(event) => updateField('interval', event.target.value as PlanInterval)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field(
            'jobPostCredit',
            'Job slots',
            <Input
              id="jobPostCredit"
              inputMode="numeric"
              value={form.jobPostCredit}
              error={Boolean(errors.jobPostCredit)}
              onChange={(event) => updateField('jobPostCredit', event.target.value)}
            />
          )}
          {field(
            'profileViewsCredit',
            'Profile views',
            <Input
              id="profileViewsCredit"
              inputMode="numeric"
              value={form.profileViewsCredit}
              error={Boolean(errors.profileViewsCredit)}
              onChange={(event) => updateField('profileViewsCredit', event.target.value)}
            />
          )}
          {field(
            'emailSendingCredit',
            'Email Job invites',
            <Input
              id="emailSendingCredit"
              inputMode="numeric"
              value={form.emailSendingCredit}
              error={Boolean(errors.emailSendingCredit)}
              onChange={(event) => updateField('emailSendingCredit', event.target.value)}
            />
          )}
          {field(
            'smsSendingCredit',
            'SMS Job invites',
            <Input
              id="smsSendingCredit"
              inputMode="numeric"
              value={form.smsSendingCredit}
              error={Boolean(errors.smsSendingCredit)}
              onChange={(event) => updateField('smsSendingCredit', event.target.value)}
            />
          )}
          {field(
            'resumeDownloadCredit',
            'Resume downloads',
            <Input
              id="resumeDownloadCredit"
              inputMode="numeric"
              value={form.resumeDownloadCredit}
              error={Boolean(errors.resumeDownloadCredit)}
              onChange={(event) => updateField('resumeDownloadCredit', event.target.value)}
            />
          )}
          {field(
            'employeesSeatsCredit',
            'Employee seats',
            <Input
              id="employeesSeatsCredit"
              inputMode="numeric"
              value={form.employeesSeatsCredit}
              error={Boolean(errors.employeesSeatsCredit)}
              onChange={(event) => updateField('employeesSeatsCredit', event.target.value)}
            />
          )}
          <div>
            <Label htmlFor="resumeSearchCredit">Resume search</Label>
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.resumeSearchUnlimited}
                onChange={(event) => updateField('resumeSearchUnlimited', event.target.checked)}
              />
              Unlimited
            </label>
            {!form.resumeSearchUnlimited && (
              <Input
                id="resumeSearchCredit"
                inputMode="numeric"
                value={form.resumeSearchCredit}
                error={Boolean(errors.resumeSearchCredit)}
                onChange={(event) => updateField('resumeSearchCredit', event.target.value)}
              />
            )}
            {errors.resumeSearchCredit && (
              <p className="mt-1 text-xs text-red-600">{errors.resumeSearchCredit}</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField('isActive', event.target.checked)}
          />
          Active and available for admin checkout
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : plan ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomPlanModal;
