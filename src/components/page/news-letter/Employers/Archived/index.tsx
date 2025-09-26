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
    name: "Q3 Job Market Summary",
    delivered: 1800,
    clickRate: 10.5,
    lastUpdated: "2024-09-01",
    publishedDate: "2024-08-30",
  },
  {
    id: "2",
    name: "Summer Internship Guide",
    delivered: 2200,
    clickRate: 12.8,
    lastUpdated: "2024-08-15",
    publishedDate: "2024-08-10",
  },
  {
    id: "3",
    name: "Professional Development Tips",
    delivered: 1600,
    clickRate: 9.2,
    lastUpdated: "2024-07-20",
    publishedDate: "2024-07-15",
  },
  {
    id: "4",
    name: "Company Culture Insights",
    delivered: 2500,
    clickRate: 15.6,
    lastUpdated: "2024-06-25",
    publishedDate: "2024-06-20",
  },
  {
    id: "5",
    name: "Work-Life Balance Strategies",
    delivered: 2000,
    clickRate: 11.9,
    lastUpdated: "2024-05-30",
    publishedDate: "2024-05-25",
  },
];

export default function ArchivedNewsletters() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Archived Newsletters</h2>
      <p className="mb-6">Here you can view and manage archived newsletters for job seekers.</p>

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
              <TableCell
                isHeader
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
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
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="outline" size="sm">
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
