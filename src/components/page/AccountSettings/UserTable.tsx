'use client';

import React, { useState } from 'react';
import { User } from '@/services/types/auth';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { DotsIcon } from '@/components/ui/icons';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';

interface UserTableProps {
  users: User[];
  onUserAction: (userId: string, action: 'manage' | 'remove') => void;
}

const UserActionDropdown: React.FC<{ userId: string; onAction: (userId: string, action: 'manage' | 'remove') => void }> = ({ userId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <DotsIcon className="w-5 h-5 text-gray-600" />
      </button>
        <Dropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="w-32"
      >
        <DropdownItem
          onClick={() => {
            onAction(userId, 'manage');
            setIsOpen(false);
          }}
        >
          Manage
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            onAction(userId, 'remove');
            setIsOpen(false);
          }}
          className="text-red-600 hover:bg-red-50"
        >
          Remove
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

const UserTable: React.FC<UserTableProps> = ({ users, onUserAction }) => {
  const getAccessBadge = () => {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Add
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Edit
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Delete
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Deactivate
        </span>
      </div>
    );
  };

  const getUserDisplayName = (user: User): string => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getUserInitials = (user: User): string => {
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Users Management</h2>
      </div>
      
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100">
              <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell
                  isHeader
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Job Position
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Access
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 mr-3">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {getUserInitials(user)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium font-medium text-gray-900 dark:text-white">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="font-medium font-medium text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getAccessBadge()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <UserActionDropdown userId={user.id} onAction={onUserAction} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
        </div>
     
    </div>
  );
};

export default UserTable;
