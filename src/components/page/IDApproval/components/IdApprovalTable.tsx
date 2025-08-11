import { FC } from 'react';

import TableHeading from '@/components/tables/tableHeader';
import Avatar from '@/components/ui/avatar/Avatar';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { UseIdApprovalLogic } from '@/services/types/idApproval';

import Button from '@/components/ui/button/Button';
import { EyeIcon } from '@/icons';
import AccountStatus from './AccountStatus';
import Status from './Status';

interface Props {
  data: UseIdApprovalLogic['data'];
  isLoading: UseIdApprovalLogic['isLoading'];
  tableColumns: UseIdApprovalLogic['tableColumns'];
  setSelected: UseIdApprovalLogic['setSelected'];
}

const IdApprovalTable: FC<Props> = ({ data, isLoading, tableColumns, setSelected }) => {
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
          data.map((row) => {
            const { id, fullName, email, isLocked, status } = row

            return (
              <TableRow key={`id-approval-${id}`}>
                <TableCell className="text-gray-800 py-6 px-4">
                  <div className='flex items-center gap-2'>
                    <Avatar
                      src={row.profilePicture || undefined}
                      alt={fullName}
                      name={fullName}
                      size="small"
                      className="rounded-full" 
                    />
                    <p className="text-sm text-gray-900 dark:text-white">
                      {fullName}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {email}
                  </p>
                </TableCell>
                <TableCell className="text-gray-800 py-6 px-4">
                  <AccountStatus isLocked={isLocked} />
                </TableCell>
                <TableCell className="text-gray-900 py-6 px-4">
                  <Status status={status} />
                </TableCell>
                <TableCell className="text-gray-900 py-6 px-4 text-right">
                  <Button 
                    variant="ghost" 
                    className="inline-flex items-center justify-center font-medium gap-2 transition text-brand-400 h-[45px] w-[100px] rounded-sm px-3 text-xs  "
                    onClick={() => setSelected(row)}
                    startIcon={<EyeIcon />}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

export default IdApprovalTable