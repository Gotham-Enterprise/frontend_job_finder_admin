import { FC } from "react";

import TableHeading from "@/components/tables/tableHeader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UseAppointmentsLogic } from "@/services/hooks/useAppointmentsLogic";
import { Appointment } from "@/services/types/appointment";

import { APPOINTMENT_FACILITATOR, formatEasternDate, formatEasternTimeRange } from "../helpers";
import AppointmentRowActions from "./AppointmentRowActions";
import Status from "./Status";

interface Props {
  data: UseAppointmentsLogic["data"];
  isLoading: UseAppointmentsLogic["isLoading"];
  tableColumns: UseAppointmentsLogic["tableColumns"];
  filters: UseAppointmentsLogic["filters"];
  onSortChange: UseAppointmentsLogic["onSortChange"];
  onViewDetails: UseAppointmentsLogic["onViewDetails"];
  onEdit: (appointment: Appointment) => void;
}

const AppointmentsTable: FC<Props> = ({
  data,
  isLoading,
  tableColumns,
  filters,
  onSortChange,
  onViewDetails,
  onEdit,
}) => {
  return (
    <Table>
      <TableHeading
        columns={tableColumns}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={onSortChange}
      />
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={tableColumns.length}>
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </TableCell>
          </TableRow>
        )}
        {data.length === 0 && !isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={tableColumns.length}>
              <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
            </TableCell>
          </TableRow>
        )}
        {data.length > 0 &&
          !isLoading &&
          data.map((row) => {
            const { id, referenceNumber, firstName, lastName, companyName, email, phoneNumber, startAt, endAt, status } =
              row;

            return (
              <TableRow
                key={`appointment-${id}`}
                className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{referenceNumber}</p>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {firstName} {lastName}
                  </p>
                  {companyName && <p className="text-xs text-gray-500 dark:text-gray-400">{companyName}</p>}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{email}</p>
                  {phoneNumber && <p className="text-xs text-gray-500 dark:text-gray-400">{phoneNumber}</p>}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{formatEasternDate(startAt)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatEasternTimeRange(startAt, endAt)}</p>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {row.facilitator?.name || APPOINTMENT_FACILITATOR.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {row.facilitator?.title || APPOINTMENT_FACILITATOR.title}
                  </p>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Status status={status} />
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <AppointmentRowActions appointment={row} onView={onViewDetails} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default AppointmentsTable;
