import { FC, useMemo } from "react";

import TableHeading from "@/components/tables/tableHeader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UseIdApprovalDetailLogic } from "@/services/types/idApproval";
import { formatDateTime } from "@/services/utils";

interface Props {
  activityLogs: UseIdApprovalDetailLogic["activityLogs"];
}

const ActivityLogs: FC<Props> = ({ activityLogs }) => {
  const columns = useMemo(() => {
    return [
      {
        key: "timestamp",
        label: "Date & Time",
      },
      {
        key: "attempts",
        label: "Login Attempts",
      },
      {
        key: "ipAddress",
        label: "IP Address",
      },
    ];
  }, []);

  return (
    <div className="rounded-xl bg-white py-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex border-b-1 px-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Logs</h3>
      </div>
      <div className="flex flex-col pb-4">
        <Table>
          <TableHeading columns={columns} className="bg-gray-100 dark:bg-gray-700" />
          <TableBody>
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <TableRow key={log.minute}>
                  <TableCell className="py-4 px-6">{formatDateTime(log.minute)}</TableCell>
                  <TableCell className="py-4 px-6">{log.attempts}</TableCell>
                  <TableCell className="py-4 px-6">{log.ipAddress}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-4 px-6 text-center">
                  No activity logs available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ActivityLogs;
