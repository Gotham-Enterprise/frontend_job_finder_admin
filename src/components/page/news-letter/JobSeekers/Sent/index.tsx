import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../../ui/table";
import Button from "../../../../ui/button/Button";

interface EmailData {
  id: string;
  name: string;
  delivered: number;
  clickRate: number;
  lastUpdated: string;
  publishedDate: string;
}

const staticEmailData: EmailData[] = [
  {
    id: "1",
    name: "Monthly Job Market Update",
    delivered: 2100,
    clickRate: 14.2,
    lastUpdated: "2024-09-25",
    publishedDate: "2024-09-22",
  },
  {
    id: "2",
    name: "Skill Development Series",
    delivered: 1900,
    clickRate: 16.8,
    lastUpdated: "2024-09-24",
    publishedDate: "2024-09-20",
  },
  {
    id: "3",
    name: "Networking Tips",
    delivered: 2400,
    clickRate: 11.5,
    lastUpdated: "2024-09-23",
    publishedDate: "2024-09-18",
  },
  {
    id: "4",
    name: "Career Transition Guide",
    delivered: 2800,
    clickRate: 19.3,
    lastUpdated: "2024-09-22",
    publishedDate: "2024-09-15",
  },
  {
    id: "5",
    name: "Remote Work Opportunities",
    delivered: 3200,
    clickRate: 13.7,
    lastUpdated: "2024-09-21",
    publishedDate: "2024-09-12",
  },
];

export default function SentNewsletters() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sent</h2>
      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email Name
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Delivered
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Click Rate
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Last Updated
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Published / Send Date
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {staticEmailData.map((email) => (
              <TableRow key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {email.name}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {email.delivered.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {email.clickRate}%
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(email.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(email.publishedDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
