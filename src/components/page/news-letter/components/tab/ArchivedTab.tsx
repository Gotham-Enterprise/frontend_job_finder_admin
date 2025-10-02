"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";

const ArchivedTab = () => {
  return (
    <div className="overflow-hidden">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Email Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Delivered
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Click Rate
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Last Updated
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Published / Send Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            <TableRow>
              <TableCell className="px-5 py-4 text-start">
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Old Job Market Report</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">1,200</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">14.2%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">8/15/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">8/10/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-5 py-4 text-start">
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Summer Internship Guide</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">980</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">11.5%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">7/20/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">7/15/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-5 py-4 text-start">
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Career Change Stories</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">1,450</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9.8%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">6/25/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">6/20/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArchivedTab;
