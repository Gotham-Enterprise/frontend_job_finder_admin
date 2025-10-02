"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";

const NewsLetterComponent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto">
        {/* Newsletter Categories */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="flex justify-between items-center mx-auto px-4 pb-5 pt-5 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">News Letter Management</h1>
              <p className="mt-2 text-gray-600">Create, manage, and send news letter to your audience</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push("/admin/news-letter/create")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Newsletter
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                News Letter
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Sent
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Drafts
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Archived
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="py-6">
            <div className="mb-6">
              {/* Newsletter Table */}
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
                      {[
                        {
                          name: "Weekly Job Opportunities",
                          delivered: "1,500",
                          clickRate: "12.5%",
                          lastUpdated: "9/25/2024",
                          publishDate: "9/20/2024",
                        },
                        {
                          name: "Career Tips Newsletter",
                          delivered: "2,200",
                          clickRate: "8.3%",
                          lastUpdated: "9/24/2024",
                          publishDate: "9/18/2024",
                        },
                        {
                          name: "Industry Insights",
                          delivered: "1,800",
                          clickRate: "15.2%",
                          lastUpdated: "9/23/2024",
                          publishDate: "9/15/2024",
                        },
                        {
                          name: "Resume Building Guide",
                          delivered: "3,200",
                          clickRate: "22.1%",
                          lastUpdated: "9/22/2024",
                          publishDate: "9/10/2024",
                        },
                        {
                          name: "Interview Preparation",
                          delivered: "2,800",
                          clickRate: "18.7%",
                          lastUpdated: "9/21/2024",
                          publishDate: "9/5/2024",
                        },
                      ].map((newsletter, index) => (
                        <TableRow key={index}>
                          <TableCell className="px-5 py-4 text-start">
                            <span className="font-medium text-gray-900 text-sm dark:text-white/90">
                              {newsletter.name}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {newsletter.delivered}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {newsletter.clickRate}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {newsletter.lastUpdated}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {newsletter.publishDate}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetterComponent;
