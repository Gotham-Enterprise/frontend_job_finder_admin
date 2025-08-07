import { FC } from 'react';

import { UseIdApprovalLogic } from '@/services/types/idApproval'
import { Table, TableBody, TableCell, TableRow  } from '@/components/ui/table';
import TableHeading from '@/components/tables/tableHeader';

interface Props {
  data: UseIdApprovalLogic['data'];
  isLoading: UseIdApprovalLogic['isLoading'];
  tableColumns: UseIdApprovalLogic['tableColumns'];
}

const IdApprovalTable: FC<Props> = ({ data, isLoading, tableColumns }) => {
  return (
    <Table>
      <TableHeading columns={tableColumns} />
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={5}>
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </TableCell>
          </TableRow>
        )}
        {data.length === 0 && !isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={5}>
              <p className="text-gray-500 dark:text-gray-400">No unlock requests found</p>
            </TableCell>
          </TableRow>
        )}
        {data.length > 0 && !isLoading && (
          data.map(({ id, fullName, email, isLocked, status }) => (
            <TableRow key={`id-approval-${id}`}>
              <TableCell className="text-gray-800 py-6 px-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {fullName}
                </p>
              </TableCell>
              <TableCell className="text-gray-800 py-6 px-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {email}
                </p>
              </TableCell>
              <TableCell className="text-gray-800 py-6 px-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {isLocked ? 'Locked' : 'Unlocked'}
                </p>
              </TableCell>
              <TableCell className="text-gray-800 py-6 px-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {status}
                </p>
              </TableCell>
              <TableCell className="text-gray-800 py-6 px-4">
                <p className="text-sm text-gray-900 dark:text-white text-right">
                  Manage
                </p>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default IdApprovalTable