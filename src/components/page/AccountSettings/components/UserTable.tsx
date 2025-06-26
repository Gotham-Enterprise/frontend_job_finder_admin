'use client';

import React, { useState } from 'react';
import { User } from '@/services/types/auth';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { DotsIcon } from '@/components/ui/icons';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import Avatar from '@/components/ui/avatar/Avatar';


interface ExtendedUser extends User {
  lastActivity?: string;
}

interface UserTableProps {
  users: ExtendedUser[];
  onUserAction: (userId: string, action: 'manage' | 'remove') => void;
}

const UserActionDropdown: React.FC<{
  userId: string;
  onAction: (userId: string, action: 'manage' | 'remove') => void;
}> = ({ userId, onAction }) => {
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
  const getUserDisplayName = (user: User): string => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getUserInitials = (user: User): string => {
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-purple-600 dark:text-purple-400';
      case 'manager':
        return 'text-blue-600 dark:text-blue-400';
      case 'user':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Users Management
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {users.length} total users
            </p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100">
            <TableRow className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                Role
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={getUserDisplayName(user)}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className={`text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6">                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <UserActionDropdown userId={user.id} onAction={onUserAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;
