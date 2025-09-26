import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../../ui/table";
import { Dropdown } from "../../../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../../../ui/dropdown/DropdownItem";
import { DotsIcon } from "../../../../ui/icons";

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
    name: "Weekly Job Opportunities",
    delivered: 1500,
    clickRate: 12.5,
    lastUpdated: "2024-09-25",
    publishedDate: "2024-09-20",
  },
  {
    id: "2",
    name: "Career Tips Newsletter",
    delivered: 2200,
    clickRate: 8.3,
    lastUpdated: "2024-09-24",
    publishedDate: "2024-09-18",
  },
  {
    id: "3",
    name: "Industry Insights",
    delivered: 1800,
    clickRate: 15.2,
    lastUpdated: "2024-09-23",
    publishedDate: "2024-09-15",
  },
  {
    id: "4",
    name: "Resume Building Guide",
    delivered: 3200,
    clickRate: 22.1,
    lastUpdated: "2024-09-22",
    publishedDate: "2024-09-10",
  },
  {
    id: "5",
    name: "Interview Preparation",
    delivered: 2800,
    clickRate: 18.7,
    lastUpdated: "2024-09-21",
    publishedDate: "2024-09-05",
  },
];

export default function AllEmailsNewsletters() {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (emailId: string) => {
    setOpenDropdownId(openDropdownId === emailId ? null : emailId);
  };

  const handleEdit = (emailId: string) => {
    console.log("Edit email:", emailId);
    setOpenDropdownId(null);
  };

  const handleClone = (emailId: string) => {
    console.log("Clone email:", emailId);
    setOpenDropdownId(null);
  };

  const handleArchive = (emailId: string) => {
    console.log("Archive email:", emailId);
    setOpenDropdownId(null);
  };

  const handleSaveAsTemplate = (emailId: string) => {
    console.log("Save email as template:", emailId);
    setOpenDropdownId(null);
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Emails</h2>
      <div>
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
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(email.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dropdown-toggle"
                    >
                      <DotsIcon className="w-5 h-5" />
                    </button>
                    <Dropdown
                      isOpen={openDropdownId === email.id}
                      onClose={() => setOpenDropdownId(null)}
                      className="w-48"
                    >
                      <DropdownItem onClick={() => handleEdit(email.id)}>Edit</DropdownItem>
                      <DropdownItem onClick={() => handleClone(email.id)}>Clone</DropdownItem>
                      <DropdownItem onClick={() => handleArchive(email.id)}>Archive</DropdownItem>
                      <DropdownItem onClick={() => handleSaveAsTemplate(email.id)}>Save email as template</DropdownItem>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
