import { FC, useMemo } from "react";

import TableHeading from "@/components/tables/tableHeader";
import Avatar from "@/components/ui/avatar/Avatar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UseDocumentVerificationLogic } from "@/services/types/documentVerification";

import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { EyeIcon } from "@/icons";
import Status from "./Status";

interface Props {
  data: UseDocumentVerificationLogic["data"];
  isLoading: UseDocumentVerificationLogic["isLoading"];
  tableColumns: UseDocumentVerificationLogic["tableColumns"];
  filters: UseDocumentVerificationLogic["filters"];
  checked: UseDocumentVerificationLogic["checked"];
  checkedItems: UseDocumentVerificationLogic["checkedItems"];
  isPending: UseDocumentVerificationLogic["isPending"];
  onChangeChecked: UseDocumentVerificationLogic["onChangeChecked"];
  onChangeCheckedItem: UseDocumentVerificationLogic["onChangeCheckedItem"];
  onViewDetails: UseDocumentVerificationLogic["onViewDetails"];
}

// Category keys are the backend's raw camelCase enum values (e.g. "stateLicenses") — this
// list only ever needs a human label, unlike the candidate wallet's full category config.
function humanizeCategory(category: string): string {
  return category
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

const DocumentVerificationTable: FC<Props> = ({
  data,
  isLoading,
  tableColumns,
  checked,
  checkedItems,
  isPending,
  onChangeChecked,
  onChangeCheckedItem,
  onViewDetails,
}) => {
  const columns = useMemo(() => {
    if (isPending) {
      return [
        {
          key: "id",
          label: <Checkbox checked={checkedItems.length ? checked : false} onChange={onChangeChecked} />,
        },
        ...tableColumns,
      ];
    }

    return tableColumns;
  }, [checked, isPending, tableColumns, checkedItems, onChangeChecked]);

  return (
    <Table>
      <TableHeading columns={columns} />
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={6}>
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </TableCell>
          </TableRow>
        )}
        {data.length === 0 && !isLoading && (
          <TableRow>
            <TableCell className="text-center py-8 px-6" colSpan={6}>
              <p className="text-gray-500 dark:text-gray-400">No documents found</p>
            </TableCell>
          </TableRow>
        )}
        {data.length > 0 &&
          !isLoading &&
          data.map((row) => {
            const { kind, id, category, documentName, verificationStatus, candidate } = row;
            const isChecked = checkedItems.some((item) => item.kind === kind && item.id === id);
            const fullName = candidate?.user?.fullName || "Unknown Candidate";

            return (
              <TableRow key={`document-verification-${kind}-${id}`}>
                {isPending && (
                  <TableCell className="py-4 px-6">
                    <Checkbox checked={isChecked} onChange={() => onChangeCheckedItem(kind, id)} />
                  </TableCell>
                )}
                <TableCell className="text-gray-800 py-6 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar alt={fullName} name={fullName} size="small" className="rounded-full" />
                    <p className="text-sm text-gray-900 dark:text-white">{fullName}</p>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{candidate?.user?.email}</p>
                </TableCell>
                <TableCell className="text-gray-800 py-6 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{humanizeCategory(category)}</p>
                </TableCell>
                <TableCell className="text-gray-800 py-6 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">{documentName}</p>
                </TableCell>
                <TableCell className="text-gray-900 py-6 px-4">
                  <Status status={verificationStatus} />
                </TableCell>
                <TableCell className="text-gray-900 py-6 px-4 text-right">
                  <Button
                    variant="ghost"
                    className="inline-flex items-center justify-center font-medium gap-2 transition text-brand-400 h-[45px] w-[100px] rounded-sm px-3 text-xs  "
                    onClick={() => onViewDetails(kind, id)}
                    startIcon={<EyeIcon />}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default DocumentVerificationTable;
