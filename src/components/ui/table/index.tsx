import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";


interface TableProps {
  children: ReactNode; 
  className?: string;
}


interface TableHeaderProps {
  children: ReactNode; 
  className?: string;
}


interface TableBodyProps {
  children: ReactNode; 
  className?: string;
}


interface TableRowProps {
  children: ReactNode; 
  className?: string;
}

interface TableCellProps {
  children: ReactNode; 
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
}


const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <table className={twMerge("min-w-full", className)}>{children}</table>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className || ''}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className || ''}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className || ''}>{children}</tr>;
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className || ''} colSpan={colSpan}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
export {
  dataTableTableClass,
  dataTableScrollWrapClass,
  dataTableHeaderRowClass,
  dataTableHeaderCellClass,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableTruncatedTextClass,
} from './dataTable';
