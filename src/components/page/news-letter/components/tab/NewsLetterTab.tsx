"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";

const NewsLetterTab = () => {
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Weekly Job Opportunities</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">1,500</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">12.5%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/25/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/20/2024</TableCell>
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Career Tips Newsletter</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">2,200</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">8.3%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/24/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/18/2024</TableCell>
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Industry Insights</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">1,800</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">15.2%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/23/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/15/2024</TableCell>
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Resume Building Guide</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">3,200</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">22.1%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/22/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/10/2024</TableCell>
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">Interview Preparation</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">2,800</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">18.7%</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/21/2024</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">9/5/2024</TableCell>
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

export default NewsLetterTab;
