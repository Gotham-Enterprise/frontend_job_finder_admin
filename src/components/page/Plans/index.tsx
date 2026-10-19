'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/input/Input';
import Pagination from '@/components/tables/Pagination';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ErrorState from '@/components/common/ErrorState';
import { BoltIcon } from '@/icons';
import { useConfirmation } from '@/hooks/useConfirmation';
import { PlanInterval } from '@/services/types/subscription';
import { AdminSubscriptionPlan, PlanKind } from '@/services/types/subscriptionPlan';
import {
  useAdminSubscriptionPlans,
  useCreateCustomPlan,
  useUpdateCustomPlan,
  useUpdateCustomPlanStatus,
} from '@/services/hooks/useAdminSubscriptionPlans';
import CustomPlanModal from './CustomPlanModal';

const INTERVAL_LABELS: Record<PlanInterval, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
};

const formatPrice = (priceInCents: number) =>
  (priceInCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

const formatCredit = (value: number | null) => (value === null ? 'Unlimited' : value.toLocaleString());

const PlansPage: React.FC = () => {
  const [kind, setKind] = useState<PlanKind>('standard');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [interval, setInterval] = useState<PlanInterval | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminSubscriptionPlan | null>(null);
  const confirmation = useConfirmation();

  const { data, isLoading, isFetching, error, refetch } = useAdminSubscriptionPlans({
    kind,
    page,
    limit: 20,
    keyword,
    interval,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const createPlan = useCreateCustomPlan();
  const updatePlan = useUpdateCustomPlan();
  const updateStatus = useUpdateCustomPlanStatus();

  const plans = data?.data || [];
  const meta = data?.metaData;

  const switchKind = (nextKind: PlanKind) => {
    setKind(nextKind);
    setPage(1);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEdit = (plan: AdminSubscriptionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const toggleStatus = async (plan: AdminSubscriptionPlan) => {
    const nextActive = !plan.isActive;
    const confirmed = await confirmation.confirm({
      title: nextActive ? 'Activate plan' : 'Deactivate plan',
      message: nextActive
        ? `Make "${plan.name}" available for admin checkout?`
        : `Turn off "${plan.name}"? It will no longer be available for new purchases or quotes.`,
      confirmText: nextActive ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    await updateStatus.mutateAsync({ id: plan.id, isActive: nextActive });
  };

  if (error) {
    return (
      <ErrorState
        message={`Error loading plans: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Plans</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {meta?.totalCount || 0} {kind === 'custom' ? 'custom' : 'standard'} plans
              {isFetching && <span className="ml-2 text-xs text-blue-500">Updating...</span>}
            </p>
          </div>
          {kind === 'custom' && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Add custom plan
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {(['standard', 'custom'] as PlanKind[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchKind(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                kind === tab
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {tab === 'standard' ? 'Plans' : 'Custom plans'}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
          />
          <select
            value={interval}
            onChange={(event) => {
              setInterval(event.target.value as PlanInterval | '');
              setPage(1);
            }}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">All intervals</option>
            {Object.entries(INTERVAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Interval</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Job posts</th>
              <th className="px-4 py-3 font-medium">Profiles</th>
              <th className="px-4 py-3 font-medium">Emails</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Search</th>
              <th className="px-4 py-3 font-medium">Seats</th>
              <th className="px-4 py-3 font-medium">Employers</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {kind === 'custom' && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={kind === 'custom' ? 12 : 11} className="px-6 py-10 text-center text-gray-500">
                  Loading plans...
                </td>
              </tr>
            )}
            {!isLoading && plans.length === 0 && (
              <tr>
                <td colSpan={kind === 'custom' ? 12 : 11} className="px-6 py-10 text-center text-gray-500">
                  {kind === 'custom' ? 'No custom plans yet.' : 'No plans found.'}
                </td>
              </tr>
            )}
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">{plan.name}</div>
                  {plan.description && (
                    <div className="mt-1 max-w-xs truncate text-xs text-gray-500">{plan.description}</div>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{INTERVAL_LABELS[plan.interval]}</td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{formatPrice(plan.priceInCents)}</td>
                <td className="px-4 py-4">{formatCredit(plan.jobPostCredit)}</td>
                <td className="px-4 py-4">{formatCredit(plan.profileViewsCredit)}</td>
                <td className="px-4 py-4">{formatCredit(plan.emailSendingCredit)}</td>
                <td className="px-4 py-4">{formatCredit(plan.resumeDownloadCredit)}</td>
                <td className="px-4 py-4">{formatCredit(plan.resumeSearchCredit)}</td>
                <td className="px-4 py-4">{formatCredit(plan.employeesSeatsCredit)}</td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                  {plan.subscriberCount.toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      plan.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {kind === 'custom' && (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(plan)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(plan)}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300"
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}

      <CustomPlanModal
        isOpen={isModalOpen}
        plan={editingPlan}
        isLoading={createPlan.isPending || updatePlan.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          try {
            if (editingPlan) {
              await updatePlan.mutateAsync({ id: editingPlan.id, payload });
            } else {
              await createPlan.mutateAsync(payload);
            }
            setIsModalOpen(false);
          } catch {
            // The mutation hook already shows the error toast.
          }
        }}
      />
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        title={confirmation.config?.title || ''}
        message={confirmation.config?.message || ''}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
      />
    </div>
  );
};

export default PlansPage;
