"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogout } from "@/services/hooks/useAuth";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import LogoutIcon from "../ui/icons/Logout";
import { profileDropdownItems } from "./helper";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: logout, isPending } = useLogout();
  const authData = useAuthStorage();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative">      
    <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-brand-100 dark:bg-brand-800 flex items-center justify-center">
          {authData.user?.adminProfile?.avatarUrl ? (
            <img 
              src={authData.user.adminProfile.avatarUrl} 
              alt="User avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-brand-600 dark:text-brand-300 font-medium text-sm">
              {authData.userInitials}
            </span>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{authData.displayName}</span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {authData.displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {authData.user?.email}
          </span>
        </div>

     <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
  {profileDropdownItems.map((item, index) => (
    <li key={index}>
      <DropdownItem
        onItemClick={closeDropdown}
        tag="a"
        href={item.href}
        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      >
        <item.Icon className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
        {item.label}
      </DropdownItem>
    </li>
  ))}
</ul>
       
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full"
          type="button"
        >
          <LogoutIcon
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
          />
          {isPending ? "Signing out..." : "Sign out"}
        </button>
      </Dropdown>
    </div>
  );
}
