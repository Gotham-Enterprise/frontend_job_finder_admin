"use client";
import React from "react";
import { useRouter } from "next/navigation";

const NewsLetterComponent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
              <p className="mt-2 text-gray-600">Create, manage, and send newsletters to your audience</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Import Emails
              </button>
              <button
                onClick={() => router.push("/admin/news-letter/create")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Newsletter Categories */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Newsletter Categories</h2>
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
          <div className="px-6 py-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">All News Letter</h3>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                <div>Email Name</div>
                <div>Delivered</div>
                <div>Click Rate</div>
                <div>Last Updated</div>
                <div>Published / Send Date</div>
                <div>Actions</div>
              </div>

              {/* Newsletter Items */}
              <div className="space-y-3">
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
                  <div key={index} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100 text-sm">
                    <div className="font-medium text-gray-900">{newsletter.name}</div>
                    <div className="text-gray-600">{newsletter.delivered}</div>
                    <div className="text-gray-600">{newsletter.clickRate}</div>
                    <div className="text-gray-600">{newsletter.lastUpdated}</div>
                    <div className="text-gray-600">{newsletter.publishDate}</div>
                    <div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Recipients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employers Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Employers Newsletter</h3>
              <p className="text-sm text-gray-600">Manage newsletters for employer audience</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">No employer newsletters yet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Seekers Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Job Seekers Newsletter</h3>
              <p className="text-sm text-gray-600">Manage newsletters for job seeker audience</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">No job seeker newsletters yet</p>
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
