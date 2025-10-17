"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { newsletterApi, ArchivedNewsletter } from "../../../../../services/api/newsLetter";

const ArchivedTab = () => {
  const [newsletters, setNewsletters] = useState<ArchivedNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArchivedNewsletters();
  }, [page]);

  const fetchArchivedNewsletters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsletterApi.getArchivedNewsletters({
        page,
        limit: 10,
      });

      if (response.success) {
        setNewsletters(response.data);
        if (response.metaData) {
          setTotalPages(response.metaData.totalPages);
        }
      }
    } catch (err) {
      console.error("Error fetching archived newsletters:", err);
      setError("Failed to load archived newsletters");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">{error}</div>
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
            {newsletters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No archived newsletters found
                </TableCell>
              </TableRow>
            ) : (
              newsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-900 text-sm dark:text-white/90">{newsletter.emailName}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.delivered.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.clickRate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {formatDate(newsletter.lastUpdated)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {formatDate(newsletter.publishedDate)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <button className="text-gray-400 hover:text-gray-600">Restore</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ArchivedTab;
