"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "All Contacts", path: "/admin/newsletters/contacts" },
  { label: "Lists", path: "/admin/newsletters/contacts/lists" },
];

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
