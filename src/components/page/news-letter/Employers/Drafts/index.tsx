import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../../ui/table";
import Button from "../../../../ui/button/Button";

interface EmailData {
  id: string;
  name: string;
  delivered: number;
  clickRate: string;
  lastUpdated: string;
  publishedDate: string;
}

const staticEmailData: EmailData[] = [
  {
    id: "1",
    name: "Upcoming Events Newsletter",
    delivered: 0,
    clickRate: "N/A",
    lastUpdated: "2024-09-25",
    publishedDate: "Not sent",
  },
  {
    id: "2",
    name: "Freelance Opportunities",
    delivered: 0,
    clickRate: "N/A",
    lastUpdated: "2024-09-24",
    publishedDate: "Not sent",
  },
  {
    id: "3",
    name: "Job Search Strategies",
    delivered: 0,
    clickRate: "N/A",
    lastUpdated: "2024-09-23",
    publishedDate: "Not sent",
  },
  {
    id: "4",
    name: "Industry Trends Report",
    delivered: 0,
    clickRate: "N/A",
    lastUpdated: "2024-09-22",
    publishedDate: "Not sent",
  },
  {
    id: "5",
    name: "Mentorship Program Update",
    delivered: 0,
    clickRate: "N/A",
    lastUpdated: "2024-09-21",
    publishedDate: "Not sent",
  },
];

export default function DraftsNewsletters() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Draft News Letter</h2>

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
                  {email.clickRate}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(email.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {email.publishedDate}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="outline" size="sm">
                    Publish
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
