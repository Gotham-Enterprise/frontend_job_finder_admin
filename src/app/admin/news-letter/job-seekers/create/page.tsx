"use client";

import React from "react";
import Link from "next/link";

export default function CreateJobSeekersNewsletterPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Job Seekers Newsletter</h1>
        <Link href="/admin/news-letter/job-seekers" className="text-primary underline">
          Back
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-sm">
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Newsletter title" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea className="w-full border rounded px-3 py-2 h-40" placeholder="Write your newsletter..." />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 border rounded">
              Save Draft
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
