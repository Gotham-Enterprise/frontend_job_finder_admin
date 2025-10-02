"use client";
import React from "react";
import { useRouter } from "next/navigation";

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
      </div>
    </div>
  );
};

export default NewsLetterComponent;
