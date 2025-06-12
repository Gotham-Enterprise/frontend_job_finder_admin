import React from 'react';
import { TableHeader, TableRow, TableCell } from '../ui/table';

interface TableHeaderColumn {
  key: string;
  label: string;
  className?: string;
}

interface TableHeadingProps {
  columns: TableHeaderColumn[];
  className?: string;
}

const TableHeading: React.FC<TableHeadingProps> = ({
  columns,
  className = ""
}) => {
  return (
    <TableHeader className={className}>
      <TableRow className="border-b border-gray-200 dark:border-gray-800">
        {columns.map((column) => (
          <TableCell
            key={column.key}
            className={`py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm ${column.className || ''}`}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHeader>
  );
};

export default TableHeading;
