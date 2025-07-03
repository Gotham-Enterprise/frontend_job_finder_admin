import React from 'react';
import { formatDateTimeEST } from '@/services/utils/dateUtils';
import { showToast } from '@/services/utils/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon, TimeIcon, CopyIcon } from '@/icons';
import { CouponsTableProps } from '@/services/types/CouponsTypes';

const CouponsTable: React.FC<CouponsTableProps> = ({
  data,
  isLoading,
  tableColumns,
  onViewCoupon,
}) => {
  const formatDiscount = (coupon: any) => {
    if (coupon.amountOffInCents) {
      return `$${(coupon.amountOffInCents / 100).toFixed(2)}`;
    }
    if (coupon.percentOff) {
      return `${coupon.percentOff}%`;
    }
    return 'N/A';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success('Copied!', `${text} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast.error('Copy Failed', 'Unable to copy redemption code');
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={10}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={10}>
                <p className="text-gray-500 dark:text-gray-400">No coupons found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((coupon: any) => (
              <TableRow key={coupon.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {coupon.title}
                    </p>
                    {coupon.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      {coupon.redemptionCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(coupon.redemptionCode)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Copy redemption code"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatDiscount(coupon)}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white uppercase">
                    {coupon.currency}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {coupon.duration}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={coupon.isOnlyAdminCanApply ? 'solid' : 'light'}>
                    {coupon.isOnlyAdminCanApply ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={coupon.deactivatedAt ? 'light' : 'solid'}>
                    {coupon.deactivatedAt ? 'Inactive' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {coupon.createdAt ? (() => {
                    const createdAt = formatDateTimeEST(coupon.createdAt);
                    if (typeof createdAt === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {createdAt}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{createdAt.date}</div>
                        <div className="flex items-center mt-1">
                          <TimeIcon className="mr-1" />
                          <span>{createdAt.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {coupon.updatedAt ? (() => {
                    const updatedAt = formatDateTimeEST(coupon.updatedAt);
                    if (typeof updatedAt === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {updatedAt}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{updatedAt.date}</div>
                        <div className="flex items-center mt-1">
                          <TimeIcon className="mr-1" />
                          <span>{updatedAt.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
               
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CouponsTable;
