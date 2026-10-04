import React from 'react';
import Link from 'next/link';
import { Modal } from '../../../ui/modal';
import Button from '../../../ui/button/Button';
import Badge from '../../../ui/badge/Badge';
import { CouponRedemptionsModalProps } from '@/services/types/CouponsTypes';
import { useCouponRedemptions } from '@/services/hooks/useCoupons';
import { formatDateTimeEST } from '@/services/utils/dateUtils';

const formatRedeemedAt = (redeemedAt: string) => {
  const formatted = formatDateTimeEST(redeemedAt);
  if (typeof formatted === 'string') return formatted;
  return `${formatted.date} ${formatted.time}`;
};

const CouponRedemptionsModal: React.FC<CouponRedemptionsModalProps> = ({
  isOpen,
  couponId,
  couponTitle,
  onClose,
}) => {
  const { data, isLoading, isError, error, refetch } = useCouponRedemptions(
    isOpen ? couponId : null
  );

  const redeemers = data?.data?.redeemers ?? [];
  const title = data?.data?.title || couponTitle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-3xl w-full rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex max-h-[85vh] flex-col bg-white dark:bg-gray-900">
        <div className="shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon redemptions</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Employers who redeemed {title ? `"${title}"` : 'this coupon'}. Each employer is counted once.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading redemptions...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : 'Failed to load redemptions.'}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : redeemers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No employers have redeemed this coupon.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="py-2 pr-4 font-medium">Employer</th>
                    <th className="py-2 pr-4 font-medium">Contact</th>
                    <th className="py-2 pr-4 font-medium">Redeemed</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemers.map((redeemer) => (
                    <tr
                      key={redeemer.companyId}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/employers/details/${redeemer.companyId}`}
                          className="font-medium text-brand-500 hover:text-brand-600 hover:underline"
                        >
                          {redeemer.companyName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        <p>{redeemer.contactName || '—'}</p>
                        {redeemer.contactEmail && (
                          <p className="text-gray-500 dark:text-gray-400">{redeemer.contactEmail}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {formatRedeemedAt(redeemer.redeemedAt)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="light"
                          color={redeemer.stillApplied ? 'success' : 'light'}
                        >
                          {redeemer.stillApplied ? 'Still applied' : 'No longer applied'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CouponRedemptionsModal;
