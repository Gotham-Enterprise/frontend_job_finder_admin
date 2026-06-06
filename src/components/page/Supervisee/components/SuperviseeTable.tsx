import React from "react";
import { Eye, Pencil } from "lucide-react";
import { formatDate } from "@/services/utils/dateUtils";
import { formatUsStateCodeForDisplay } from "@/services/utils/formatUsStateLicensure";
import { formatUSPhoneNationalDisplay } from "@/services/utils/phoneNumberUtils";
import {
  FORMAT_LABELS,
  HOW_SOON_LABELS,
} from "@/services/utils/superviseeProfileForm";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Avatar from "../../../ui/avatar/Avatar";
import TableHeading from "../../../tables/tableHeader";
import Badge from "../../../ui/badge/Badge";
import { SuperviseeTableProps } from "@/services/types/SuperviseeTypes";

const ACTION_ICON_PX = 16;
const actionIconProps = { size: ACTION_ICON_PX, className: "shrink-0" } as const;

const SuperviseeTable: React.FC<SuperviseeTableProps> = ({
  data,
  isLoading,
  tableColumns,
  onViewSupervisee,
  onEditSupervisee,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                  Loading supervisees...
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <span>No supervisees found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((supervisee) => (
              <TableRow
                key={supervisee.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={supervisee.profilePhotoUrl || undefined}
                      name={supervisee.fullName || "?"}
                      size="small"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                        {supervisee.fullName || "—"}
                      </p>
                      {supervisee.contactNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatUSPhoneNationalDisplay(supervisee.contactNumber)}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {supervisee.email}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatUsStateCodeForDisplay(supervisee.state) || (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {supervisee.preferredFormat
                    ? FORMAT_LABELS[supervisee.preferredFormat] ?? supervisee.preferredFormat
                    : <span className="text-gray-400 italic">—</span>}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {supervisee.howSoonLooking
                    ? HOW_SOON_LABELS[supervisee.howSoonLooking] ?? supervisee.howSoonLooking
                    : <span className="text-gray-400 italic">—</span>}
                </TableCell>

                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    variant="solid"
                    color={supervisee.emailVerified ? "success" : "warning"}
                    size="sm"
                  >
                    {supervisee.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(supervisee.createdAt)}
                </TableCell>

                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewSupervisee(supervisee.id)}
                      title="View details"
                      className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors"
                    >
                      <Eye {...actionIconProps} />
                    </button>
                    <button
                      onClick={() =>
                        onEditSupervisee(supervisee.id, supervisee.fullName || supervisee.email)
                      }
                      title="Edit supervisee"
                      className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors"
                    >
                      <Pencil {...actionIconProps} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SuperviseeTable;
