"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { getNewsletters } from "@/services/api/newsletterService";

interface Newsletter {
  id: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design?: any;
  createdAt: string;
  updatedAt: string;
}

const NewsLetterTab = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewsletters();
        setNewsletters(data);
      } catch (err) {
        console.error("Failed to fetch newsletters:", err);
        setError("Failed to load newsletters");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (newsletters.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No newsletters found</p>
        <p className="text-gray-400 text-sm mt-1">Create your first newsletter to get started</p>
      </div>
    );
  }

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
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                From Name
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
                Created Date
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
            {newsletters.map((newsletter) => (
              <TableRow key={newsletter.id}>
                <TableCell className="px-5 py-4 text-start">
                  <span className="font-medium text-gray-900 text-sm dark:text-white/90">{newsletter.subject}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      newsletter.status === "SENT"
                        ? "bg-green-100 text-green-800"
                        : newsletter.status === "SCHEDULED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {newsletter.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  {newsletter.fromName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  {formatDate(newsletter.updatedAt)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  {formatDate(newsletter.createdAt)}
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
  );
};

export default NewsLetterTab;
